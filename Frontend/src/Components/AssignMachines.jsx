import React, { useState, useEffect } from "react";

const AssignMachines = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [formData, setFormData] = useState({
    orderId: "",
    customer: "",
    item: "",
    quantity: "",
    deliveryDate: "",
    priority: "",
  });

  const processTypes = [
    "COMPOUND MIXING",
    "TUFTING",
    "CUTTING",
    "LABELLING & PACKING",
  ];

  useEffect(() => {
    fetchOrders();
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

  const handleAssignMachineToProcess = async (orderId, process) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://kera-internship.onrender.com/assign/assignMachines/${orderId}/${process}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Assignment failed");
      setAssignedMachines(data.assignedMachines);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const url = editingOrder
        ? `https://kera-internship.onrender.com/order/edit/${editingOrder._id}`
        : "https://kera-internship.onrender.com/order/add";
      const method = editingOrder ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      fetchOrders();
      setShowModal(false);
      setFormData({
        orderId: "",
        customer: "",
        item: "",
        quantity: "",
        deliveryDate: "",
        priority: "",
      });
      setEditingOrder(null);
    } catch (err) {
      setError("Failed to save order");
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData(order);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await fetch(`https://kera-internship.onrender.com/order/delete/${id}`, {
      method: "DELETE",
    });
    fetchOrders();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          + Add Order
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Order</label>
        <select
          value={selectedOrderId}
          onChange={(e) => {
            setSelectedOrderId(e.target.value);
            const selected = orders.find((o) => o.orderId === e.target.value);
            setAssignedMachines(selected?.assignedMachines || []);
          }}
          className="w-full border p-2 rounded-md"
        >
          <option value="">-- Select an order --</option>
          {orders.map((order) => (
            <option key={order._id} value={order.orderId}>
              {order.orderId} - {order.customer}
            </option>
          ))}
        </select>
      </div>

      {selectedOrderId && (
        <div className="bg-gray-50 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">
            Assign Machines for Each Process
          </h3>
          {processTypes.map((process) => (
            <div key={process} className="mb-3">
              <div className="flex items-center justify-between">
                <span>{process}</span>
                <button
                  onClick={() =>
                    handleAssignMachineToProcess(selectedOrderId, process)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  Assign Machine
                </button>
              </div>
            </div>
          ))}

          {assignedMachines.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Assigned Machines:</h4>
              <ul className="mt-2 space-y-2">
                {assignedMachines.map((machine, index) => (
                  <li
                    key={index}
                    className="bg-white p-3 shadow-sm rounded-md flex justify-between items-center"
                  >
                    <div>
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
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-sm"
                    >
                      Unassign
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">All Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded-md shadow">
              <p>
                <strong>Order ID:</strong> {order.orderId}
              </p>
              <p>
                <strong>Customer:</strong> {order.customer}
              </p>
              <p>
                <strong>Item:</strong> {order.item}
              </p>
              <p>
                <strong>Quantity:</strong> {order.quantity}
              </p>
              <p>
                <strong>Priority:</strong> {order.priority}
              </p>
              <p>
                <strong>Delivery Date:</strong>{" "}
                {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(order)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(order._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingOrder ? "Edit Order" : "Add New Order"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                name="orderId"
                placeholder="Order ID"
                value={formData.orderId}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="customer"
                placeholder="Customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="item"
                placeholder="Item"
                value={formData.item}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate.split("T")[0]}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                name="priority"
                placeholder="Priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex justify-end mt-5 gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingOrder(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignMachines;
