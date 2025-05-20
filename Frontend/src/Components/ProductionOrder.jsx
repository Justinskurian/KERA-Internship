import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductionOrder = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const [orderData, setOrderData] = useState({
    orderId: "",
    customer: "",
    quantity: "",
    priority: "",
    item: "KERA#050623-11",
    isNonChangeable: false,
    deliveryDate: "",
  });

  // Fetch orders and schedule info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, scheduleRes] = await Promise.all([
          axios.get("https://kera-internship.onrender.com/order"),
          axios.get(
            "https://production-scheduler-backend-7qgb.onrender.com/scheduling/schedule"
          ),
        ]);

        const deliveryMap = {};
        scheduleRes.data.forEach((item) => {
          if (item.stageName === "LABELLING & PACKING") {
            const { orderNumber, scheduledEnd } = item;
            if (
              !deliveryMap[orderNumber] ||
              new Date(scheduledEnd) > new Date(deliveryMap[orderNumber])
            ) {
              deliveryMap[orderNumber] = scheduledEnd;
            }
          }
        });

        setOrders(ordersRes.data);
        setScheduleData(deliveryMap);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://kera-internship.onrender.com/order/add", {
        ...orderData,
        orderDate: new Date(),
      });
      alert("Order created successfully!");
      setOrderData({
        orderId: "",
        customer: "",
        quantity: "",
        priority: "",
        item: "KERA#050623-11",
        isNonChangeable: false,
        deliveryDate: "",
      });
      const updatedOrders = await axios.get(
        "https://kera-internship.onrender.com/order"
      );
      setOrders(updatedOrders.data);
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="px-4 py-10">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-10">
        Production Orders
      </h2>

      <div className="flex flex-col lg:flex-row gap-20 justify-center items-start">
        {/* Orders List */}
        <section className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders available.</p>
          ) : (
            orders.map((po) => (
              <div
                key={po._id}
                className="grid grid-cols-2 gap-5 bg-gray-100 p-6 rounded-lg shadow-md m-2 mt-7"
              >
                <div>
                  <p className="text-gray-500">Order Number</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {po.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {po.customer}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {po.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Priority</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {po.priority}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Mapped Delivery Date</p>
                  <p className="text-md font-medium text-orange-600">
                    {scheduleData[po.orderId]
                      ? new Date(scheduleData[po.orderId]).toLocaleString()
                      : "Not Scheduled"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-center mt-4">
                  <button
                    onClick={() => navigate(`/details/${po._id}`)}
                    className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-700"
                  >
                    See Full Details
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Create Order Form */}
        <section className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10">
          <h2 className="text-3xl font-semibold text-gray-700 text-center mb-8">
            Create New Order
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "orderId", type: "text" },
              { name: "customer", type: "text" },
              { name: "item", type: "text" },
              { name: "quantity", type: "number" },
              { name: "priority", type: "number", min: 1, max: 5 },
              { name: "deliveryDate", type: "date" },
            ].map(({ name, type, min, max }) => (
              <div key={name}>
                <label className="block text-gray-600 font-medium mb-1 capitalize">
                  {name === "deliveryDate" ? "Delivery Date" : name}
                </label>
                <input
                  type={type}
                  name={name}
                  value={orderData[name]}
                  onChange={handleChange}
                  required
                  min={min}
                  max={max}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            ))}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isNonChangeable"
                checked={orderData.isNonChangeable}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-600 font-medium">
                Is Non-Changeable
              </label>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                className="bg-orange-600 text-white font-semibold px-8 py-3 rounded-full shadow-md transition duration-300 hover:bg-orange-700"
              >
                Create Order
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProductionOrder;
