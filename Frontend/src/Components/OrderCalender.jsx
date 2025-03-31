import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

const OrderCalendar = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/order")
      .then((res) => setOrders(res.data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Order Calendar Overview
      </h2>

      <div className="p-8 bg-white shadow-2xl rounded-2xl">
        <Calendar
          className="rounded-lg shadow-md p-4 text-gray-800 w-full transition-all transform hover:scale-101"
          tileClassName={({ date }) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            return orders.some(
              (order) =>
                formattedDate === format(new Date(order.deliveryDate), "yyyy-MM-dd")
            )
              ? "bg-orange-600 text-white font-bold rounded-lg hover:scale-110 transition-transform"
              : "hover:bg-gray-200 rounded-lg transition-all";
          }}
          tileContent={({ date }) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const order = orders.find(
              (order) =>
                formattedDate === format(new Date(order.deliveryDate), "yyyy-MM-dd")
            );

            return order ? (
              <div className="bg-orange-600 text-white text-xs p-1 rounded-md shadow-md">
                {order.item} ({order.quantity})
              </div>
            ) : null;
          }}
        />
      </div>
    </div>
  );
};

export default OrderCalendar;
