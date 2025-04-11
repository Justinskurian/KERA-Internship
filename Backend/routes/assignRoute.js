const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Machine = require("../models/machineModel");
const Schedule = require("../models/scheduleModel"); 

const router = express.Router();

router.post("/assignMachines/:orderId/:process", async (req, res) => {
  try {
    const { orderId, process } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const alreadyAssigned = order.assignedMachines.some(
      (m) => m.process === process
    );
    if (alreadyAssigned) {
      return res.status(400).json({ error: `Process '${process}' is already assigned` });
    }

    // Find matching machine config for the process
    const machineOptions = await Machine.find({ process });
    if (!machineOptions.length) {
      return res.status(404).json({ error: `No machine found for process '${process}'` });
    }

    // Sort machines by earliest available end_time
    const machineSchedules = await Promise.all(
      machineOptions.map(async (machine) => {
        const scheduled = await Schedule.find({ machineId: machine.name }).sort({ end_time: -1 }).limit(1);
        const lastEnd = scheduled.length ? new Date(scheduled[0].end_time) : new Date();
        return { machine, availableFrom: lastEnd };
      })
    );

    machineSchedules.sort((a, b) => a.availableFrom - b.availableFrom);
    const best = machineSchedules[0];
    const { machine, availableFrom } = best;

    // Get previous process end time
    const processOrder = ["COMPOUND MIXING", "TUFTING", "CUTTING", "PRINTING", "LABELLING & PACKING"];
    const currentIndex = processOrder.indexOf(process);
    let earliestStart = new Date(availableFrom);

    if (currentIndex > 0) {
      const previous = order.assignedMachines.find(m => m.process === processOrder[currentIndex - 1]);
      if (previous) {
        const prevEnd = new Date(previous.end_time);
        if (prevEnd > earliestStart) earliestStart = prevEnd;
      }
    }

    const {
      batch_size,
      timePerProduct,
      unitMaterialPerProduct,
      efficiency
    } = machine;
    
    if (
      batch_size == null ||
      unitMaterialPerProduct == null ||
      timePerProduct == null ||
      efficiency == null
    ) {
      return res.status(400).json({
        error: `Machine config missing values for '${machine.name}'`,
      });
    }
    
    console.log("Scheduling", batches, "batches for process", process);
    
    const totalQty = order.quantity;
    const batches = Math.max(1, Math.ceil(totalQty / batch_size));
    const assignments = [];
    
    let currentStart = new Date(earliestStart);
    
    for (let i = 0; i < batches; i++) {
      const qty = i === batches - 1 ? totalQty - i * batch_size : batch_size;
      const processTimeMin = (qty * unitMaterialPerProduct * timePerProduct) / efficiency;
    
      const end = new Date(currentStart.getTime() + processTimeMin * 60000);
    
      const scheduleEntry = new Schedule({
        process,
        machineId: machine.name,
        status: "Active",
        start_time: currentStart,
        end_time: end,
      });
    
      console.log("Saving schedule entry:", scheduleEntry);
    
      await scheduleEntry.save();
    
      assignments.push({
        machineId: machine.name,
        process,
        start_time: currentStart,
        end_time: end,
      });
    
      currentStart = new Date(end);
    }
    

    // Update order
    order.assignedMachines.push({
      machineId: machine.name,
      process,
      start_time: assignments[0].start_time,
      end_time: assignments[assignments.length - 1].end_time,
    });
    await order.save();

    res.status(200).json({
      message: "Machine(s) assigned and scheduled successfully",
      assignedMachines: order.assignedMachines,
    });
  } catch (error) {
    console.error("Assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
console.log("Assigning process:", process, "for order:", orderId);
console.log("Order fetched:", order);
console.log("Available machines:", machineOptions);
console.log("Sorted machine schedules:", machineSchedules);
console.log("Selected machine:", machine.name, "available from:", availableFrom);


module.exports = router;