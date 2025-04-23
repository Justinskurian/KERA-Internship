import React, { useState, useEffect } from "react";
import axios from "axios";


const AssignMachines = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSchedule = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3000/assign/autoschedule");
      setMessage(res.data.message || "Scheduling complete!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to schedule orders.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-700">Auto Schedule Orders</h1>
      <button
        onClick={handleSchedule}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Scheduling..." : "Run Scheduler"}
      </button>
      {message && (
        <p className={`text-lg ${message.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AssignMachines;