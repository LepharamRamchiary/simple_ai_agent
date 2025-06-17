// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import ReactMarkdown from "react-markdown";

// export default function TicketDetailsPage() {
//   const { id } = useParams();
//   const [ticket, setTicket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTicket = async () => {
//       console.log("Fetching ticket for ID:", id);
      
//       const token = localStorage.getItem("token");
      
//       if (!id || !token) {
//         setLoading(false);
//         setError("Missing ticket ID or authentication token");
//         return;
//       }

//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const data = await res.json();
//         console.log("Full API response:", data);

//         if (res.ok && data.ticket) {
//           console.log("Successfully received ticket:", data.ticket.title);
//           setTicket(data.ticket);
//           setError(null);
//         } else {
//           const errorMsg = data.message || "Failed to fetch ticket";
//           console.error("API Error:", errorMsg);
//           setError(errorMsg);
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setError("Something went wrong: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTicket();
//   }, [id]); // Remove token from dependency array

//   console.log("Current state - Loading:", loading, "Ticket:", ticket, "Error:", error);

//   if (loading) {
//     return <div className="text-center mt-10">Loading ticket details...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center mt-10">
//         <p className="text-red-500">Error: {error}</p>
//       </div>
//     );
//   }

//   if (!ticket) {
//     return <div className="text-center mt-10">Ticket not found</div>;
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

//       <div className="card bg-gray-800 shadow p-4 space-y-4">
//         <h3 className="text-xl font-semibold">{ticket.title}</h3>
//         <p>{ticket.description}</p>

//         {/* Always show basic info */}
//         <div className="divider">Metadata</div>
//         <p>
//           <strong>Status:</strong> {ticket.status || 'Not set'}
//         </p>

//         {ticket.priority && (
//           <p>
//             <strong>Priority:</strong> {ticket.priority}
//           </p>
//         )}

//         {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
//           <p>
//             <strong>Related Skills:</strong> {ticket.relatedSkills.join(", ")}
//           </p>
//         )}

//         {ticket.helpfulNotes && (
//           <div>
//             <strong>Helpful Notes:</strong>
//             <div className="prose max-w-none rounded mt-2">
//               <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
//             </div>
//           </div>
//         )}

//         {ticket.assignedTo && (
//           <p>
//             <strong>Assigned To:</strong> {ticket.assignedTo.email}
//           </p>
//         )}

//         {ticket.createdAt && (
//           <p className="text-sm text-gray-500 mt-2">
//             Created At: {new Date(ticket.createdAt).toLocaleString()}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleTicketClick = (ticketId) => {
    console.log("Navigating to ticket:", ticketId);
    navigate(`/tickets/${ticketId}`);
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
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="card shadow-md p-4 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => handleTicketClick(ticket._id)}
          >
            <h3 className="font-bold text-lg">{ticket.title}</h3>
            <p className="text-sm">{ticket.description}</p>
            <p className="text-sm text-gray-500">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>
    </div>
  );
}