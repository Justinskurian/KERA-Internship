const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  customer: String,
  item: String,
  quantity: Number,
  priority: Number,
  rate: String,
  orderDate: Date,
  deliveryDate: Date,
  assignedMachines: [
    {
      machineId: String,
      process: String, 
      start_time: Date,
      end_time: Date,
    },
  ],
});

const Order = mongoose.model("Orderdata", orderSchema);
module.exports = Order;

