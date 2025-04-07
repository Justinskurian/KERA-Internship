import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProductionOrder = ({ child }) => {
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    axios
      .get("https://kera-internship.onrender.com/order")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get("https://kera-internship.onrender.com/machine")
      .then((res) => setBom(res.data))
      .catch((error) => console.error("Error fetching BOM:", error));

    axios
      .get("https://kera-internship.onrender.com/schedule")
      .then((res) => setSchedule(res.data))
      .catch((error) => console.error("Error fetching Schedule:", error));
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "N/A"; // Fallback if date is invalid
    }
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-6">
        Production Orders
      </h2>
      <div className="flex flex-co items-center justify-center  ">
        <main className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl p-10 items-center">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders available.</p>
          ) : (
            orders.map((poData, index) => {
              const formattedDeliveryDate = formatDateTime(poData.deliveryDate);
              const orderSchedules = schedule.filter(
                (sch) => sch.status === "Idle"
              );

              return (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-5 bg-gray-100 p-6 rounded-lg shadow-md items-center m-2 mt-7"
                >
                  <div>
                    <p className="text-gray-500">Order Number</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {poData.orderId}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {poData.customer}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {poData.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Requested Delivery Date</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formattedDeliveryDate}
                    </p>
                  </div>

                 

                  <div className="col-span-2 flex justify-center mt-4">
                    <Link to="/details">
                      <button className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-600 hover:shadow-lg">
                        See Full Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductionOrder;
