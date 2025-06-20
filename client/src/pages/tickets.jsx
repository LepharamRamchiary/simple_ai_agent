import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Add navigate hook

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); // Refresh list
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle ticket click - using navigate as backup
  const handleTicketClick = (ticketId, e) => {
    console.log('Ticket clicked:', ticketId);
    
    // If Link doesn't work, use navigate as fallback
    // e.preventDefault();
    // navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket._id}
            className="card shadow-md p-4 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer block"
            to={`/tickets/${ticket._id}`}
            onClick={(e) => handleTicketClick(ticket._id, e)}
          >
            <h3 className="font-bold text-lg text-white">{ticket.title}</h3>
            <p className="text-sm text-gray-300">{ticket.description}</p>
            <p className="text-sm text-gray-500">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>
            <div className="text-xs text-blue-400 mt-2">
              Click to view details →
            </div>
          </Link>
        ))}
        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>

      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-900 rounded text-xs">
        <h4 className="font-bold mb-2">Debug Info:</h4>
        <p>Total tickets: {tickets.length}</p>
        <p>Current URL: {window.location.pathname}</p>
        {tickets.length > 0 && (
          <p>First ticket ID: {tickets[0]._id}</p>
        )}
      </div>
    </div>
  );
}