import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useParams } from "react-router-dom";

const Details = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [filteredBOM, setFilteredBOM] = useState([]);
  const [orderQuantity, setOrderQuantity] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    if (orders.length > 0) {
      const matchedOrder = orders.find((order) => order._id === orderId);
      setSelectedOrder(matchedOrder || orders[0]);
    }
  }, [orders, orderId]);

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
      .get("https://kera-internship.onrender.com/schedule")
      .then((res) => setScheduleData(res.data))
      .catch((error) => console.error("Error fetching schedule:", error));
  }, []);

  useEffect(() => {
    if (selectedOrder && bom.length > 0) {
      setOrderQuantity(selectedOrder.quantity);
      setFilteredBOM(bom);
    }
  }, [selectedOrder, bom]);

  const deliveryDate = selectedOrder?.deliveryDate
    ? new Date(selectedOrder.deliveryDate)
    : null;

  const machineWorkingDates = scheduleData
    .filter((entry) => selectedOrder && entry.orderId === selectedOrder.orderId)
    .flatMap((entry) => {
      const dates = [];
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toDateString()); // Convert to string for comparison
      }

      return dates;
    });

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Order Details
      </h2>

      {/* Order Selection Dropdown */}
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
              {order.orderId}-{order.customer} - (Qty: {order.quantity})
            </option>
          ))}
        </select>
      </div>

      {/* Process Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {filteredBOM.length > 0 ? (
          filteredBOM.map((bom, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-700 text-center mb-4">
                {bom.process}
              </h3>

              <div className="text-center text-gray-700 text-lg font-medium mt-4">
                Quantity:{" "}
                <span className="font-bold text-orange-600">
                  {orderQuantity * bom.unitMaterialPerProduct}
                </span>
              </div>

              <div className="mt-6 text-gray-700">
                <h4 className="text-lg font-semibold text-center m-4">
                  Components Required:
                </h4>
                {bom.components && bom.components.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {bom.components.map((component, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>{component.name}</span>
                        <span className="text-right">
                          {component.quantity_per_kg *
                            orderQuantity *
                            bom.unitMaterialPerProduct}{" "}
                          {component.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No components listed.</p>
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
