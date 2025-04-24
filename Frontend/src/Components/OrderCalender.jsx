import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderCalendar = () => {
  const [groupedMachines, setGroupedMachines] = useState({});

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await axios.get("http://localhost:3000/schedule");
        const machines = res.data;

        // Group by process
        const grouped = machines.reduce((acc, machine) => {
          if (!acc[machine.process]) acc[machine.process] = [];
          acc[machine.process].push(machine);
          return acc;
        }, {});

        setGroupedMachines(grouped);
      } catch (err) {
        console.error("Failed to fetch machines", err);
      }
    };

    fetchMachines();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Machine Load Overview</h1>

      {Object.entries(groupedMachines).map(([process, machines]) => (
        <div key={process} className="mb-10">
          <h2 className="text-xl font-semibold text-orange-600 mb-4 border-b border-gray-300 pb-1">
            {process}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
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
                </div>

                {machine.assignedOrders.length === 0 ? (
                  <p className="text-gray-400 text-sm">No assigned orders</p>
                ) : (
                  <div className="space-y-3">
                    {machine.assignedOrders.map((order, idx) => {
                      const firstBatch = order.batches[0];
                      const lastBatch = order.batches[order.batches.length - 1];

                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 p-3 rounded-xl border border-gray-200"
                        >
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Order ID: {order.orderId}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            Batches: {order.batches.length}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(firstBatch.start_time).toLocaleString()} →{" "}
                            {new Date(lastBatch.end_time).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCalendar;
