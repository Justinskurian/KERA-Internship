const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Schedule = require("../models/scheduleModel");

const router = express.Router();

// Assign machines per process
router.post("/assignMachines/:orderId/:process", async (req, res) => {
  try {
    const { orderId, process } = req.params;

    // 1. Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Check if this process is already assigned in the order
    const alreadyAssigned = order.assignedMachines.some(
      (m) => m.process === process
    );
    if (alreadyAssigned) {
      return res.status(400).json({ error: `Process '${process}' is already assigned` });
    }

    // 3. Find an available (Idle) machine for the given process
    const availableMachine = await Schedule.findOne({ process, status: "Idle" });
    if (!availableMachine) {
      return res.status(400).json({ error: `No available machine for process '${process}'` });
    }

    // 4. Assign it
    const assignment = {
      machineId: availableMachine.machineId,
      process: availableMachine.process,
      start_time: availableMachine.start_time,
      end_time: availableMachine.end_time,
    };

    // 5. Push to assignedMachines and mark schedule as Active
    order.assignedMachines.push(assignment);
    await order.save();

    await Schedule.updateOne(
      { _id: availableMachine._id },
      { $set: { status: "Active" } }
    );

    res.status(200).json({
      message: "Machine assigned successfully",
      assignedMachines: order.assignedMachines,
    });
  } catch (error) {
    console.error("Error assigning machine:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unassign a specific machine for a process
router.post("/unassignMachine/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { machineId, process } = req.body;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Filter out the machine from assignedMachines
    const updatedMachines = order.assignedMachines.filter(
      (m) => !(m.machineId === machineId && m.process === process)
    );

    order.assignedMachines = updatedMachines;
    await order.save();

    // Set the machine's status back to 'Idle'
    await Schedule.findOneAndUpdate(
      { machineId, process },
      { status: "Idle" }
    );

    res.status(200).json({
      message: "Machine unassigned successfully",
      assignedMachines: updatedMachines,
    });
  } catch (err) {
    console.error("Error unassigning machine:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
