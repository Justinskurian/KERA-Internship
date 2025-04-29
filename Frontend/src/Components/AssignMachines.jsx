import React, { useState } from "react";
import axios from "axios";

const AssignMachines = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [shiftExtended, setShiftExtended] = useState(false);

  const handleSchedule = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("https://production-scheduler-backend-7qgb.onrender.com/scheduling/auto-schedule");
      setMessage(res.data.message || "Scheduling complete!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to schedule orders.");
    }
    setLoading(false);
  };

  const handleIncreaseShift = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("https://kera-internship.onrender.com/assign/increaseShift");
      setShiftExtended(true);
      setMessage("Production hours successfully extended by 6 hours.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to extend production hours.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center rounded-2xl items-center min-h-[85vh] bg-gray-100 px-10">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-xl border border-orange-100 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-700">
          Auto Schedule & Shift Control
        </h1>
        <p className="text-gray-500 text-center">
          Run the scheduler and extend shifts to improve order completion times.
        </p>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleSchedule}
            className={`px-6 py-3 font-semibold rounded-full shadow-md transition duration-300
              ${loading ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Run Scheduler"}
          </button>

          <button
            onClick={handleIncreaseShift}
            className={`px-6 py-3 font-semibold rounded-full shadow-md transition duration-300
              ${loading ? "bg-orange-300" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
            disabled={loading}
          >
            {loading ? "Increasing..." : "Extend Production Hours"}
          </button>
        </div>

        {message && (
          <div
            className={`text-center text-lg font-medium px-4 py-2 rounded-lg transition-all duration-300
              ${message.includes("Failed") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
          >
            {message}
          </div>
        )}

        {shiftExtended && !message.includes("Failed") && (
          <p className="text-green-700 text-center text-sm">Overtime successfully enabled.</p>
        )}
      </div>
    </div>
  );
};

export default AssignMachines;
