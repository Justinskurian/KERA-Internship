const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/orderModel"); 
const Schedule = require("../models/scheduleModel"); 

const router = express.Router();

router.post("/assignMachines/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get all available machines sorted by process
    const availableMachines = await Schedule.find({ status: "Idle" });

    if (!availableMachines.length) {
      return res.status(400).json({ error: "No available machines" });
    }

    const assignedMachines = [];

    // Assign one machine per process
    const assignedProcesses = new Set();
    for (const machine of availableMachines) {
      if (!assignedProcesses.has(machine.process)) {
        assignedMachines.push({
          machineId: machine.machineId,
          process: machine.process,
          start_time: machine.start_time,
          end_time: machine.end_time,
        });

        assignedProcesses.add(machine.process);

        // Update machine status to "Active"
        await Schedule.updateOne(
          { _id: machine._id },
          { $set: { status: "Active" } }
        );
      }
    }

    // Update the order with assigned machines
    await Order.updateOne(
      { _id: order._id },
      { $set: { assignedMachines } }
    );

    res.json({ message: "Machines assigned successfully", assignedMachines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
