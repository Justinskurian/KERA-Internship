import React, { useState } from "react";
import axios from "axios";

const CreateOrder = () => {
  const [orderData, setOrderData] = useState({
    orderId: "",
    customer: "",
    quantity: "",
    deliveryDate: "",
  });

  const handleChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("https://kera-internship.onrender.com/order", orderData);
      alert("Order created successfully!");
      setOrderData({
        orderId: "",
        customer: "",
        quantity: "",
        deliveryDate: "",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl p-12">
        <h2 className="text-4xl font-semibold text-gray-700 text-center mb-10">
          Create New Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
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
              Delivery Date
            </label>
            <input
              type="datetime-local"
              name="deliveryDate"
              value={orderData.deliveryDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-md transition duration-300 hover:bg-orange-600"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
