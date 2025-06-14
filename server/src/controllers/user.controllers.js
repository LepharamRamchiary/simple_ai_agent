import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const hashed = brcypt.hash(password, 8);
    const user = await User.create({ email, password: hashed, skills });

    // Fire inngest event
    await inngest.send({
      name: "user/signup",
      date: { email },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "SignUp failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await brcypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
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
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
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
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};


export const getUsers = async (req, res) => {
    try {
        if(req.user?.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can view all users" });
        }
        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users", details: error.message });
        
    }
}
