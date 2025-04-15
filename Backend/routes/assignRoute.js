const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Machine = require("../models/machineModel");
const Schedule = require("../models/scheduleModel");

const router = express.Router();

// Assign Machine to Order Process (Simple Version)
router.post("/assignMachines/:orderId/:process", async (req, res) => {
  try {
    const { orderId, process } = req.params;

    // Fetch the order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Check if the process is already assigned
    const alreadyAssigned = order.assignedMachines.some(
      (m) => m.process === process
    );
    if (alreadyAssigned) {
      return res.status(400).json({ error: `Process '${process}' is already assigned` });
    }

    // Find a machine for the process
    const machine = await Machine.findOne({ process });
    if (!machine) {
      return res.status(404).json({ error: `No machine found for process '${process}'` });
    }

    // Assign the machine (no scheduling logic)
    order.assignedMachines.push({
      machineId: machine.name,
      process,
    });

    await order.save();

    res.status(200).json({
      message: "Machine assigned successfully",
      assignedMachines: order.assignedMachines,
    });
  } catch (error) {
    console.error("Assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unassign Machine from Order Process (Simple Version)
router.post("/unassignMachine/:orderId/:process", async (req, res) => {
  try {
    const { orderId, process } = req.params;

    // Fetch the order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Find and remove the machine for the given process
    const index = order.assignedMachines.findIndex((m) => m.process === process);
    if (index === -1) {
      return res.status(404).json({ error: `Process '${process}' not assigned` });
    }

    const removedMachine = order.assignedMachines.splice(index, 1);

    await order.save();

    res.status(200).json({
      message: `Machine unassigned from process '${process}' successfully`,
      assignedMachines: order.assignedMachines,
    });
  } catch (error) {
    console.error("Unassign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
