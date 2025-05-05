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
  status: {
    type: String,
    enum: ["Pending", "Scheduled","In Progress", "Ready to Deliver", "Delivered"],
    default: "Pending",
  },
  isNonChangeable: { type: Boolean, default: false }, // For scheduling lock
  assignedMachines: [
    {
      machineId: String,
      process: String,
    },
  ],
});

const Order = mongoose.model("Orderdata", orderSchema);
module.exports = Order;
