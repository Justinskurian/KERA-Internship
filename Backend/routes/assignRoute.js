const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Schedule = require("../models/scheduleModel");

const router = express.Router();

// ✅ Assign machines per process
router.post("/assignMachines/:orderId/:process", async (req, res) => {
  try {
    const { orderId, process } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const alreadyAssigned = order.assignedMachines.some(
      (m) => m.process === process
    );
    if (alreadyAssigned) {
      return res.status(400).json({ error: `Process '${process}' is already assigned` });
    }

    const availableMachine = await Schedule.findOne({ process, status: "Idle" });
    if (!availableMachine) {
      return res.status(400).json({ error: `No available machine for process '${process}'` });
    }

    const assignment = {
      machineId: availableMachine.machineId,
      process: availableMachine.process,
      start_time: availableMachine.start_time,
      end_time: availableMachine.end_time,
    };

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

// ✅ Unassign machine
router.post("/unassignMachine/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { machineId, process } = req.body;
  if (!machineId || !process) {
    return res.status(400).json({ error: "machineId and process are required in the request body." });
  }

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const exists = order.assignedMachines.some(
      (m) => m.machineId === machineId && m.process === process
    );
    if (!exists) {
      return res.status(400).json({ error: "Machine assignment not found for this process." });
    }

    order.assignedMachines = order.assignedMachines.filter(
      (m) => !(m.machineId === machineId && m.process === process)
    );
    await order.save();

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { machineId, process },
      { status: "Idle" },
      { new: true }
    );

    console.log("Unassigned and updated machine schedule:", updatedSchedule);

    return res.status(200).json({
      message: "Machine unassigned successfully.",
      assignedMachines: order.assignedMachines,
    });
  } catch (err) {
    console.error("❌ Error unassigning machine:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;