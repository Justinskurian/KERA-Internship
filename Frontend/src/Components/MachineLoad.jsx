import React, { useEffect, useState } from "react";
import axios from "axios";

const MachineLoad = () => {
  const [schedules, setSchedules] = useState([]);
  const [machineMeta, setMachineMeta] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, metaRes] = await Promise.all([
          axios.get("https://production-scheduler-backend-7qgb.onrender.com/scheduling/schedule"),
          axios.get("https://kera-internship.onrender.com/schedule"),
        ]);
        setSchedules(scheduleRes.data);
        setMachineMeta(metaRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const groupedByStage = schedules.reduce((acc, item) => {
    const stage = item.stageName || "Unknown";
    if (!acc[stage]) acc[stage] = {};
    if (!acc[stage][item.machineID]) acc[stage][item.machineID] = [];
    acc[stage][item.machineID].push(item);
    return acc;
  }, {});

  const calculateWorkedHours = (machineSchedules, machineID) => {
    const machine = getMachineInfo(machineID);
    const timePerProduct = machine?.time_per_product || 0;
    return machineSchedules.reduce((total, s) => {
      const duration = timePerProduct * s.quantity;
      return total + duration;
    }, 0);
  };

  const handleShiftIncrease = async (machineId, hours) => {
    try {
      const response = await axios.post(
        "https://kera-internship.onrender.com/assign/increaseShift",
        {
          machineId,
          increaseByHours: hours,
        }
      );
      alert(
        `Success: Shift extended by ${hours} hours.\nNew End Time: ${response.data.newEndTime}\nUpdated Shift Hours: ${response.data.newShiftHours}`
      );
      window.location.reload();
    } catch (err) {
      console.error("Error increasing shift:", err);
      alert("Failed to increase shift hours.");
    }
  };

  const getMachineInfo = (machineID) => {
    return machineMeta.find((m) => m._id === machineID);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Machine Load Overview
      </h1>

      {Object.entries(groupedByStage).map(([stageName, machines]) => (
        <div key={stageName} className="mb-12">
          <h2 className="text-2xl font-semibold text-orange-600 mb-6">{stageName}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(machines).map(([machineID, machineSchedules]) => {
              const machineInfo = getMachineInfo(machineID);
              const workedHours = calculateWorkedHours(machineSchedules, machineID);
              const totalWorkingHours =
                (machineInfo?.shiftHoursPerDay || 0) * (machineInfo?.workingDays || 0);
              const availableHours = (totalWorkingHours - workedHours).toFixed(2);
              const latestStatus = machineSchedules[machineSchedules.length - 1]?.status || "Idle";

              const remainingHoursColor =
                availableHours >= 0 ? "text-green-600" : "text-red-600";

              return (
                <div
                  key={machineID}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between space-y-4"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Machine: {machineInfo?.machineId || machineID}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          latestStatus === "Scheduled"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {latestStatus}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    {machineSchedules.map((s, idx) => {
                      const start = new Date(s.scheduledStart);
                      const end = new Date(s.scheduledEnd);
                      const machine = getMachineInfo(machineID);
                      const timePerProduct = machine?.time_per_product || 0;
                      const duration = (timePerProduct * s.quantity).toFixed(2);

                      return (
                        <div key={idx} className="text-sm text-gray-700">
                          <p className="font-medium text-orange-600">
                            Order: {s.orderNumber}
                          </p>
                          <p>
                            {start.toLocaleString()} → {end.toLocaleString()}
                          </p>
                          <p>Duration: {duration} hrs</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-700">
                    Total Available Hours:
                    <p className="font-medium ">{totalWorkingHours.toFixed(2)} hrs</p>
                    Total Worked Hours:
                    <p className="font-medium ">{workedHours.toFixed(2)} hrs</p>
                    Remaining Hours:
                    <p className={`${remainingHoursColor} font-semibold`}>{availableHours} hrs</p><br/>
                    <p className="font-semibold"> Increase The shift Hours per day</p>

                    <div className="mt-4 flex justify-center space-x-2">
                      <button
                        onClick={() =>
                          handleShiftIncrease(machineInfo?.machineId || machineID, 4)
                        }
                        className="bg-orange-400 text-white px-3 py-1 rounded hover:bg-orange-500 text-sm"
                      >
                        +4 hrs
                      </button>
                      <button
                        onClick={() =>
                          handleShiftIncrease(machineInfo?.machineId || machineID, 6)
                        }
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm"
                      >
                        +6 hrs
                      </button>
                      <button
                        onClick={() =>
                          handleShiftIncrease(machineInfo?.machineId || machineID, 8)
                        }
                        className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm"
                      >
                        +8 hrs
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachineLoad;
