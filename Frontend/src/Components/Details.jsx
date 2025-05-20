import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Details = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  // Fetch orders, machine BOM, and schedule data
  useEffect(() => {
    axios
      .get("https://kera-internship.onrender.com/order")
      .then((res) => setOrders(res.data))
      .catch((error) => console.error("Error fetching orders:", error));

    axios
      .get("https://kera-internship.onrender.com/machine")
      .then((res) => setBom(res.data))
      .catch((error) => console.error("Error fetching BOM:", error));

    axios
      .get("https://production-scheduler-backend-7qgb.onrender.com/scheduling/schedule")
      .then((res) => setScheduleData(res.data))
      .catch((error) => console.error("Error fetching schedule:", error));
  }, []);

  // Set selected order from URL param or default
  useEffect(() => {
    if (orders.length > 0) {
      const matchedOrder = orders.find((order) => order._id === orderId);
      setSelectedOrder(matchedOrder || orders[0]);
    }
  }, [orders, orderId]);

  // Extract delivery date from schedule data (LABELLING & PACKING)
  const getScheduledDeliveryDate = () => {
    if (!selectedOrder || scheduleData.length === 0) return null;

    const stage = scheduleData.find(
      (s) =>
        s.orderNumber === selectedOrder.orderId &&
        s.stageName === "LABELLING & PACKING"
    );

    return stage ? new Date(stage.scheduledEnd) : null;
  };

  const deliveryDate = getScheduledDeliveryDate();

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Order Details
      </h2>

      {/* Order Selection */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8 mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Select Order:
        </label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedOrder?._id || ""}
          onChange={(e) =>
            setSelectedOrder(
              orders.find((order) => order._id === e.target.value)
            )
          }
        >
          {orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order.orderId} - {order.customer} (Qty: {order.quantity})
            </option>
          ))}
        </select>

        {/* Display Delivery Date */}
        <div className="text-lg font-semibold text-gray-600 text-center mt-4">
          <span className="text-gray-700">Expected Delivery Date: </span>
          <span className="text-orange-600">
            {deliveryDate ? deliveryDate.toDateString() : "Not Scheduled"}
          </span>
        </div>
      </div>

      {/* Process Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {selectedOrder && bom.length > 0 ? (
          bom.map((process, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-700 text-center mb-4">
                {process.process}
              </h3>

              <div className="text-center text-gray-700 text-lg font-medium mt-4">
                Quantity:{" "}
                <span className="font-bold text-orange-600">
                  {selectedOrder.quantity * process.unitMaterialPerProduct}
                </span>
              </div>

              <div className="mt-6 text-gray-700">
                <h4 className="text-lg font-semibold text-center m-4">
                  Components Required:
                </h4>
                {process.components && process.components.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {process.components.map((component, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>{component.name}</span>
                        <span>
                          {(
                            component.quantity_per_kg *
                            selectedOrder.quantity *
                            process.unitMaterialPerProduct
                          ).toFixed(2)}{" "}
                          {component.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-center">No components listed.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 w-full col-span-2">
            No matching BOM data found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Details;
