import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

const Details = () => {
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [filteredBOM, setFilteredBOM] = useState([]);
  const [orderQuantity, setOrderQuantity] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    axios
      .get("https://kera-internship.onrender.com/order")
      .then((res) => setOrders(res.data))
      .catch((error) => console.error("Error fetching orders:", error));

    axios
      .get("https://kera-internship.onrender.com/machine")
      .then((res) => setBom(res.data))
      .catch((error) => console.error("Error fetching BOM:", error));
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrder(orders[0]); // Default to the first order
    }
  }, [orders]);

  useEffect(() => {
    if (selectedOrder && bom.length > 0) {
      setOrderQuantity(selectedOrder.quantity);
            setFilteredBOM(bom);  
  
      if (bom.length > 0) {
        const latestProcess = bom.reduce((latest, process) =>
          new Date(process.end_time) > new Date(latest.end_time) ? process : latest
        );
  
        setEstimatedDelivery(
          new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
          }).format(new Date(latestProcess.end_time))
        );
      } else {
        setEstimatedDelivery(null);
      }
    }
  }, [selectedOrder, bom]);
  

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
            setSelectedOrder(orders.find((order) => order._id === e.target.value))
          }
        >
          {orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order.orderId}-{order.customer} - (Qty: {order.quantity})
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Section */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Estimated Delivery:
          <span className="font-bold text-orange-600">
            {" "}
            {estimatedDelivery || "Calculating..."}
          </span>
        </h2>

        <div className="flex justify-center">
          <div className="p-6 bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-xl">
            <Calendar
              className="rounded-lg shadow-md p-4 text-gray-800 w-full transition-all transform hover:scale-101"
              tileClassName={({ date }) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                return filteredBOM.some(
                  (b) =>
                    formattedDate ===
                      format(new Date(b.start_time), "yyyy-MM-dd") ||
                    formattedDate === format(new Date(b.end_time), "yyyy-MM-dd")
                )
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold rounded-lg hover:scale-110 transition-transform"
                  : "hover:bg-gray-200 rounded-lg transition-all";
              }}
              tileContent={({ date }) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                const process = filteredBOM.find(
                  (b) =>
                    formattedDate ===
                    format(new Date(b.start_time), "yyyy-MM-dd")
                )?.process;

                return process ? (
                  <div className="bg-orange-600 text-white text-xs p-1 rounded-md shadow-md">
                    {process}
                  </div>
                ) : null;
              }}
            />
          </div>
        </div>
      </div>

      {/* Process Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {filteredBOM.length > 0 ? (
          filteredBOM.map((bom, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-700 text-center mb-4">
                {bom.process}
              </h3>

              <div className="text-gray-700 text-sm space-y-2">
                <p>
                  <strong>Start:</strong>{" "}
                  {bom.start_time
                    ? new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "UTC",
                      }).format(new Date(bom.start_time))
                    : "N/A"}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {bom.end_time
                    ? new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "UTC",
                      }).format(new Date(bom.end_time))
                    : "N/A"}
                </p>
              </div>

              <div className="text-center text-gray-700 text-lg font-medium mt-4">
                Quantity:{" "}
                <span className="font-bold text-orange-600">
                  {orderQuantity}
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
                          {component.quantity_per_kg * orderQuantity}{" "}
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