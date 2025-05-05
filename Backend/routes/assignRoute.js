const express = require("express");
const router = express.Router();

const Order = require("../models/orderModel");
const Schedule = require("../models/scheduleModel");

function parseTimeString(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function getNextWorkDate(currentDate, workingDays) {
  const date = new Date(currentDate);
  do {
    date.setDate(date.getDate() + 1);
  } while (workingDays !== 7 && (date.getDay() === 0)); // Skip Sundays if 6-day week
  return date;
}

function getShiftDuration(schedule) {
  return (schedule.shiftHoursPerDay || 8) * 60;
}

async function findAvailableMachine(process, startDate, allowOvertime = false) {
  const machines = await Schedule.find({ process }).sort({ machineId: 1 });
  machines.sort((a, b) => {
    const aLastEnd = getMachineNextAvailableTime(a);
    const bLastEnd = getMachineNextAvailableTime(b);
    return aLastEnd - bLastEnd;
  });
  if (machines.length === 0) return null;

  if (!allowOvertime) return machines;

  // Adjust shift hours to 14 if allowed
  machines.forEach(m => m.shiftHoursPerDay = 14);
  return machines;
}

function getMachineNextAvailableTime(machine) {
  if (!machine.assignedOrders.length) return new Date();
  const lastOrder = machine.assignedOrders[machine.assignedOrders.length - 1];
  const lastBatch = lastOrder.batches[lastOrder.batches.length - 1];
  return new Date(lastBatch.end_time);
}

async function assignProcess(machine, order, process, startDate, batchStartOverrides = {}) {
  const batchSize = machine.batch_size;
  const totalQuantity = order.quantity;
  const unitMaterial = machine.unit_material_per_product;
  const timePerProduct = machine.time_per_product;
  const totalBatches = Math.ceil(totalQuantity / batchSize);

  let currentTime = new Date(startDate);
  let batches = [];

  for (let i = 0; i < totalBatches; i++) {
    const batchQuantity = i === totalBatches - 1 ? totalQuantity - batchSize * i : batchSize;
    const requiredTime = batchQuantity * unitMaterial * timePerProduct * 60;

    let timeRemaining = requiredTime;
    let batchStart = batchStartOverrides[i] || new Date(currentTime);
    let shiftMins = getShiftDuration(machine);

    while (timeRemaining > 0) {
      const batchEnd = addMinutes(batchStart, Math.min(timeRemaining, shiftMins));
      timeRemaining -= shiftMins;

      batches.push({
        batchNumber: i + 1,
        quantity: batchQuantity,
        start_time: batchStart,
        end_time: batchEnd,
      });

      batchStart = getNextWorkDate(batchStart, machine.workingDays);
    }

    currentTime = new Date(batches[batches.length - 1].end_time);
  }

  const assignedOrder = {
    orderId: order.orderId,
    status: "Scheduled",
    batches,
  };

  await Schedule.updateOne(
    { machineId: machine.machineId },
    { $push: { assignedOrders: assignedOrder }, $set: { status: "Active" } }
  );

  await Order.updateOne(
    { orderId: order.orderId },
    { $push: { assignedMachines: { machineId: machine.machineId, process } } }
  );

  return batches;
}

router.post("/autoschedule", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" }).sort({ priority: 1, orderDate: 1 });
    const processes = ["COMPOUND MIXING", "TUFTING", "CUTTING", "PRINTING", "LABELLING & PACKING"];

    let previousProcessFirstBatchEnds = null; // Track the end of previous order's last batch

    for (const order of orders) {
      let currentStartTime = new Date();

      for (const process of processes) {
        let machines = await findAvailableMachine(process, currentStartTime);

        if (!machines.length) {
          machines = await findAvailableMachine(process, currentStartTime, true); // allow overtime
        }

        const machine = machines[0];

        // Pass the end time of the previous order's last batch to the current order's batch start
        const batchStartOverrides = {};
        if (previousProcessFirstBatchEnds) {
          batchStartOverrides[0] = previousProcessFirstBatchEnds; // Make sure next process starts after the previous order
        }

        const batches = await assignProcess(machine, order, process, currentStartTime, batchStartOverrides);

        // Update the end time of the first batch from the current order, which will be the start time of the next process
        previousProcessFirstBatchEnds = batches[0].end_time;

        // Update the current start time for the next process to reflect the end of the last batch of the current process
        currentStartTime = new Date(Math.max(...batches.map(b => new Date(b.end_time).getTime()))); 
      }

      await Order.updateOne(
        { orderId: order.orderId },
        { status: "Ready to Deliver", deliveryDate: currentStartTime }
      );
    }

    res.status(200).send("Auto scheduling complete");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error scheduling orders");
  }
});


// POST /increaseShift
router.post("/increaseShift", async (req, res) => {
  try {
    const { machineId, increaseByHours } = req.body;

    if (!machineId || ![4, 6, 8].includes(increaseByHours)) {
      return res.status(400).json({ error: "Invalid input." });
    }

    const machine = await Schedule.findOne({ machineId });
    if (!machine) {
      return res.status(404).json({ error: "Machine not found." });
    }

    // Parse endTime (e.g., "16:00")
    const [endHour, endMinute] = machine.endTime.split(":").map(Number);
    let newEndHour = endHour + increaseByHours;

    if (newEndHour >= 24) newEndHour %= 24; // Wrap around midnight

    const formattedEndHour = String(newEndHour).padStart(2, "0");
    const formattedEndMinute = String(endMinute).padStart(2, "0");

    machine.endTime = `${formattedEndHour}:${formattedEndMinute}`;
    
    // Save to trigger the pre-save middleware for shiftHoursPerDay
    await machine.save();

    res.status(200).json({
      message: `Shift extended by ${increaseByHours} hours.`,
      newEndTime: machine.endTime,
      newShiftHours: machine.shiftHoursPerDay,
    });
  } catch (err) {
    console.error("Error updating shift hours:", err);
    res.status(500).send("Failed to update shift hours.");
  }
});


// Resets the schedule
router.post("/resetschedule", async (req, res) => {
  try {
    await Schedule.updateMany({}, {
      $set: {
        assignedOrders: [],
        status: "Idle",
        shiftHoursPerDay: 8 // Resetting shift hours to default
      }
    });

    await Order.updateMany({}, {
      $set: {
        assignedMachines: [],
        status: "Pending",
      }
    });

    res.status(200).send("Schedule and shift hours reset successful.");
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).send("Error resetting schedule.");
  }
});


module.exports = router;
