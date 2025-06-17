import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 8);
    const user = await User.create({ email, password: hashed, skills });

    // Fire inngest event
    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.json({ user, token });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "SignUp failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("Request password:", req.body.password);
    console.log("User password from DB:", user?.password);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.json({ user, token });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Login failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;

  try {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can update user roles" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    // console.log("Authenticated user:", req.user.role);
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can view all users" });
    }
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch users", details: error.message });
  }
};
