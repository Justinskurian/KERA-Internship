import React, { useEffect, useState } from "react";
import axios from "axios";

const MachineLoad = () => {
  const [groupedMachines, setGroupedMachines] = useState({});
  const [scheduleMap, setScheduleMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main machine data
        const machinesRes = await axios.get("https://kera-internship.onrender.com/schedule");
        const machines = machinesRes.data;

        // Group machines by process
        const grouped = machines.reduce((acc, machine) => {
          if (!acc[machine.process]) acc[machine.process] = [];
          acc[machine.process].push(machine);
          return acc;
        }, {});
        setGroupedMachines(grouped);

        // Fetch schedule data
        const scheduleRes = await axios.get("https://production-scheduler-backend-7qgb.onrender.com/scheduling/schedule");
        const schedules = scheduleRes.data;

        // Group schedule by machineName
        const scheduleMap = schedules.reduce((acc, item) => {
          if (!acc[item.machineName]) acc[item.machineName] = [];
          acc[item.machineName].push(item);
          return acc;
        }, {});
        setScheduleMap(scheduleMap);

      } catch (err) {
        console.error("Error fetching machine or schedule data", err);
      }
    };

    fetchData();
  }, []);

  // Calculate the total worked hours between scheduledStart and scheduledEnd
  const calculateWorkedHours = (schedules) => {
    return schedules.reduce((acc, s) => {
      const start = new Date(s.scheduledStart);
      const end = new Date(s.scheduledEnd);
      const durationInHours = (end - start) / (1000 * 60 * 60); // in hours
      return acc + durationInHours;
    }, 0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Machine Load Overview</h1>

      {Object.entries(groupedMachines).map(([process, machines]) => (
        <div key={process} className="mb-10">
          <h2 className="text-xl font-semibold text-orange-600 mb-4 border-b border-gray-300 pb-1">
            {process}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => {
              const schedules = scheduleMap[machine.machineId] || [];

              // Calculate total working hours for this machine
              const totalWorkingHours = machine.shiftHoursPerDay * machine.workingDays;

              // Calculate total worked hours from the schedules
              const workedHours = calculateWorkedHours(schedules);

              return (
                <div
                  key={machine.machineId}
                  className="bg-white rounded-2xl shadow-md p-4 border border-gray-200"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {machine.machineId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Status: {machine.status || "Idle"}
                    </p>

                    {schedules.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {schedules.map((s, idx) => {
                          const start = new Date(s.scheduledStart);
                          const end = new Date(s.scheduledEnd);
                          const durationInHours = ((end - start) / (1000 * 60 * 60)).toFixed(2); // rounded to 2 decimal places

                          return (
                            <div key={idx} className="text-xs text-gray-500">
                              <p className="font-semibold text-orange-600">Order ID: {s.orderNumber}</p>
                              <p>
                                {start.toLocaleString()} → {end.toLocaleString()}
                              </p>
                              <p className="text-blue-600">
                                Duration: {durationInHours} hours
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Display total working hours and worked hours */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Total Working Hours: {totalWorkingHours} hours
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Worked Hours: {workedHours.toFixed(2)} hours
                    </p>
                    <p className="text-sm text-red-600">
                      Remaining Hours: {(totalWorkingHours - workedHours).toFixed(2)} hours
                    </p>
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
