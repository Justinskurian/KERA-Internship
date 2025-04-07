import React, { useState, useEffect } from "react";

const AssignMachines = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState({});
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const processTypes = [
    "COMPOUND MIXING",
    "TUFTING",
    "CUTTING",
    "LABELLING & PACKING",
  ];

  useEffect(() => {
    fetchOrders();
    fetchMachines();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://kera-internship.onrender.com/order");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders");
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await fetch("https://kera-internship.onrender.com/schedule");
      const data = await res.json();
      setMachineData(data);
    } catch (err) {
      setError("Failed to fetch machines");
    }
  };

  const handleAssignMachineToProcess = async (orderId, process) => {
    const machineId = selectedMachines[process];
    if (!machineId) return alert("Please select a machine for " + process);

    try {
      const response = await fetch(
        `https://kera-internship.onrender.com/assign/assignMachines/${orderId}/${process}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Assignment failed");

      setAssignedMachines(data.assignedMachines);
      fetchOrders();
      fetchMachines();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnassignMachine = async (orderId, machineId, process) => {
    try {
      const response = await fetch(
        `https://kera-internship.onrender.com/assign/unassignMachine/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ machineId, process }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unassignment failed");

      setAssignedMachines(data.assignedMachines);
      fetchOrders();
      fetchMachines();
    } catch (err) {
      setError(err.message);
    }
  };

  const getAvailableMachines = (process) => {
    return machineData.filter((m) => m.process === process);
  };

  const handleOrderChange = (orderId) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.orderId === orderId);
    setSelectedOrder(order || null);
    setAssignedMachines(order?.assignedMachines || []);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Assign Machines
      </h2>
  
      <div className="w-full bg-white shadow-2xl rounded-2xl p-10">
        {error && <p className="text-red-500 mb-4">{error}</p>}
  
        <label className="block mb-2 text-lg font-medium">Select Order</label>
        <select
          value={selectedOrderId}
          onChange={(e) => handleOrderChange(e.target.value)}
          className="w-full border p-3 rounded mb-8"
        >
          <option value="">-- Select an order --</option>
          {orders.map((order) => (
            <option key={order._id} value={order.orderId}>
              {order.orderId} - {order.customer}
            </option>
          ))}
        </select>
  
        {selectedOrderId && (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Order details + Assignment */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="bg-gray-100 p-6 rounded shadow">
                <h3 className="font-semibold text-xl mb-3">Order Details</h3>
                <p>
                  <strong>Customer:</strong> {selectedOrder.customer}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedOrder.quantity}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </p>
              </div>
  
              <div className="bg-gray-50 p-6 rounded shadow">
                <h3 className="font-semibold text-xl mb-4">Assign Processes</h3>
                {processTypes.map((process) => (
                  <div key={process} className="mb-4">
                    <p className="mb-1 font-medium">{process}</p>
                    <div className="flex gap-2">
                      <select
                        className="border p-2 rounded w-full"
                        value={selectedMachines[process] || ""}
                        onChange={(e) =>
                          setSelectedMachines((prev) => ({
                            ...prev,
                            [process]: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Select machine --</option>
                        {getAvailableMachines(process).map((machine) => (
                          <option key={machine._id} value={machine.machineId}>
                            {machine.machineId} ({machine.status})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          handleAssignMachineToProcess(selectedOrderId, process)
                        }
                        className="bg-orange-600 text-white px-4 py-2 rounded"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Right Column: Assigned Machines */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-6 rounded shadow h-fit">
              <h3 className="font-semibold text-xl mb-4">Assigned Machines</h3>
  
              {assignedMachines.length > 0 ? (
                <ul className="space-y-4">
                  {assignedMachines.map((machine, index) => (
                    <li
                      key={index}
                      className="bg-white p-4 rounded shadow flex flex-col"
                    >
                      <div className="mb-2">
                        <p>
                          <strong>Machine:</strong> {machine.machineId}
                        </p>
                        <p>
                          <strong>Process:</strong> {machine.process}
                        </p>
                        <p>
                          <strong>Start:</strong>{" "}
                          {new Date(machine.start_time).toLocaleString()}
                        </p>
                        <p>
                          <strong>End:</strong>{" "}
                          {new Date(machine.end_time).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleUnassignMachine(
                            selectedOrderId,
                            machine.machineId,
                            machine.process
                          )
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded self-end"
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No machines assigned yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default AssignMachines;
