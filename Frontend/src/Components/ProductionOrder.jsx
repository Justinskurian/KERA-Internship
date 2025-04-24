import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductionOrder = () => {
  const [orders, setOrders] = useState([]);
  const [bom, setBom] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();

  const handleSeeDetails = (orderId) => {
    navigate(`/details/${orderId}`);
  };

  useEffect(() => {
    axios
      .get("https://kera-internship.onrender.com/order")
      .then((res) => setOrders(res.data))
      .catch((error) => console.log(error));

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
      return "N/A";
    }
    return new Date(dateString).toLocaleString();
  };

  const [orderData, setOrderData] = useState({
    orderId: "",
    customer: "",
    quantity: "",
    priority: "",
    isNonChangeable: false,
    deliveryDate: "", // Added deliveryDate field
  });

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
      await axios.post(
        "https://kera-internship.onrender.com/order/add",
        orderData
      );
      alert("Order created successfully!");
      setOrderData({
        orderId: "",
        customer: "",
        quantity: "",
        priority: "",
        isNonChangeable: false,
        deliveryDate: "", // Reset deliveryDate field after submit
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="px-4 py-10">
      <h2 className="text-4xl font-semibold text-gray-700 text-center mb-10">
        Production Orders
      </h2>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-20">
        {/* Order List */}
        <main className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders available.</p>
          ) : (
            orders.map((poData, index) => {
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
                    <p className="text-gray-500">Priority</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {poData.priority}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Non-Changeable</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {poData.isNonChangeable ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="col-span-2 flex justify-center mt-4">
                    <button
                      onClick={() => handleSeeDetails(poData._id)}
                      className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-300 hover:bg-orange-700 hover:shadow-lg"
                    >
                      See Full Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* Order Form */}
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10">
          <h2 className="text-3xl font-semibold text-gray-700 text-center mb-8">
            Create New Order
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Order ID
              </label>
              <input
                type="text"
                name="orderId"
                value={orderData.orderId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Customer
              </label>
              <input
                type="text"
                name="customer"
                value={orderData.customer}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={orderData.quantity}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Priority (1-5)
              </label>
              <input
                type="number"
                name="priority"
                value={orderData.priority}
                onChange={handleChange}
                min={1}
                max={5}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={orderData.deliveryDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

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
        </div>
      </div>
    </div>
  );
};

export default ProductionOrder;
