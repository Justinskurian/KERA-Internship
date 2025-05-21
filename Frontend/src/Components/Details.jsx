import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Details = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  const STAGE_ORDER = [
    "COMPOUND MIXING",
    "TUFTING",
    "CUTTING",
    "PRINTING",
    "LABELLING & PACKING",
  ];

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

  useEffect(() => {
    if (orders.length > 0) {
      const matchedOrder = orders.find((order) => order._id === orderId);
      setSelectedOrder(matchedOrder || orders[0]);
    }
  }, [orders, orderId]);

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

  const getScheduleFlow = () => {
    if (!selectedOrder) return [];

    const relevantSchedules = scheduleData.filter(
      (s) => s.orderNumber === selectedOrder.orderId
    );

    return STAGE_ORDER.map((stage) =>
      relevantSchedules.find((s) => s.stageName === stage)
    ).filter(Boolean);
  };

  const formatUTC = (dateString) => {
    return new Date(dateString).toISOString().replace("T", " ").slice(0, 19) ;
  };

  const flow = getScheduleFlow();

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Order Details
      </h2>

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

        <div className="text-lg font-semibold text-gray-600 text-center mt-4">
          <span className="text-gray-700">Expected Delivery Date: </span>
          <span className="text-orange-600">
            {deliveryDate ? formatUTC(deliveryDate) : "Not Scheduled"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl p-6 rounded-xl bg-gray-100 shadow-lg rounded-2xl p-8 mb-8">
        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Production Flow Chart
        </h3>
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-6 flex-wrap">
          {flow.map((stage, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-4 w-full md:w-64 text-center border-t-4 border-orange-400"
            >
              <h4 className="text-lg font-bold text-gray-700">
                {stage.stageName}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Start:</strong> {formatUTC(stage.scheduledStart)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>End:</strong> {formatUTC(stage.scheduledEnd)}
              </p>
            </div>
          ))}
        </div>
      </div>

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
