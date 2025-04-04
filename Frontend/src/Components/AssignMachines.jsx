import React, { useState } from "react";

const AssignMachines = () => {
  const [orderId, setOrderId] = useState("");
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssignMachines = async () => {
    if (!orderId) {
      setError("Please enter an Order ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:5000/api/assignMachines/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign machines");
      }

      setAssignedMachines(data.assignedMachines);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Assign Machines to Order</h2>

      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-2 border rounded-md mb-3"
      />

      <button
        onClick={handleAssignMachines}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Assigning..." : "Assign Machines"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {assignedMachines.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Assigned Machines:</h3>
          <ul className="list-disc pl-5">
            {assignedMachines.map((machine, index) => (
              <li key={index} className="bg-white p-2 rounded-md mt-1 shadow-sm">
                <strong>Machine:</strong> {machine.machineId} <br />
                <strong>Process:</strong> {machine.process} <br />
                <strong>Start:</strong> {new Date(machine.start_time).toLocaleString()} <br />
                <strong>End:</strong> {new Date(machine.end_time).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignMachines;
