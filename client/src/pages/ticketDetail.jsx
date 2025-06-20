import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("TicketDetails: Component mounted");
    console.log("TicketDetails: Current URL:", window.location.pathname);
    console.log("TicketDetails: Ticket ID from params:", id);

    const fetchTicket = async () => {
      const token = localStorage.getItem("token");
      console.log("TicketDetails: Token exists:", !!token);

      if (!id) {
        console.error("TicketDetails: No ticket ID provided");
        setError("No ticket ID provided");
        setLoading(false);
        return;
      }

      if (!token) {
        console.error("TicketDetails: No authentication token");
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        console.log("TicketDetails: Fetching ticket with ID:", id);
        const url = `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`;
        console.log("TicketDetails: API URL:", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("TicketDetails: Response status:", res.status);
        const data = await res.json();
        console.log("TicketDetails: API response:", data);

        if (res.ok && data.ticket) {
          console.log("TicketDetails: Successfully received ticket:", data.ticket.title);
          setTicket(data.ticket);
          setError(null);
        } else {
          const errorMsg = data.message || `Failed to fetch ticket (Status: ${res.status})`;
          console.error("TicketDetails: API Error:", errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        console.error("TicketDetails: Fetch error:", err);
        setError("Network error: " + err.message);
      } finally {
        console.log("TicketDetails: Setting loading to false");
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div>Loading ticket details...</div>
        <div className="text-xs text-gray-500 mt-2">
          Ticket ID: {id}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-secondary mr-2"
        >
          Go Back
        </button>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Home
        </button>
        <div className="mt-4 text-xs text-gray-500">
          <p>Ticket ID: {id}</p>
          <p>URL: {window.location.pathname}</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center mt-10">
        <p className="mb-4">Ticket not found</p>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ticket Details</h2>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary btn-sm"
        >
          ← Back to Tickets
        </button>
      </div>

      <div className="card bg-gray-800 shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold text-white">{ticket.title}</h3>
        <p className="text-gray-300">{ticket.description}</p>

        {/* Always show basic info */}
        <div className="divider">Metadata</div>
        <p className="text-gray-300">
          <strong>Status:</strong> {ticket.status || "Not set"}
        </p>

        {ticket.priority && (
          <p className="text-gray-300">
            <strong>Priority:</strong> {ticket.priority}
          </p>
        )}

        {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
          <p className="text-gray-300">
            <strong>Related Skills:</strong> {ticket.relatedSkills.join(", ")}
          </p>
        )}

        {ticket.helpfulNotes && (
          <div>
            <strong className="text-white">Helpful Notes:</strong>
            <div className="prose max-w-none rounded mt-2 text-gray-300">
              <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
            </div>
          </div>
        )}

        {ticket.assignedTo && (
          <p className="text-gray-300">
            <strong>Assigned To:</strong> {ticket.assignedTo.email}
          </p>
        )}

        {ticket.createdAt && (
          <p className="text-sm text-gray-500 mt-2">
            Created At: {new Date(ticket.createdAt).toLocaleString()}
          </p>
        )}

        {/* Debug info */}
        <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-400">
          <strong>Debug:</strong> Ticket ID: {ticket._id}
        </div>
      </div>
    </div>
  );
}s