const mongoose = require("mongoose");

const scheduleSchema = mongoose.Schema({
  machineId: { type: String, required: true, unique: true },
  process: { type: String, required: true },

  // Machine capabilities
  batch_size: { type: Number, required: true },
  unit_material_per_product: { type: Number, required: true },
  time_per_product: { type: Number, required: true }, // in minutes or hours

  // Daily shift schedule
  startTime: { type: String, required: true }, // e.g., "08:00"
  endTime: { type: String, required: true },   // e.g., "16:00"
  shiftHoursPerDay: { type: Number }, // Will be auto-calculated
  workingDays: { type: Number, default: 6 },

  // Orders assigned to this machine
  assignedOrders: [
    {
      orderId: { type: String, required: true },
      status: {
        type: String,
        enum: ["Scheduled", "In Progress", "Completed"],
        default: "Scheduled",
      },
      batches: [
        {
          batchNumber: Number,
          quantity: Number,
          start_time: Date,
          end_time: Date,
        },
      ],
    },
  ],

  // Machine status
  status: {
    type: String,
    enum: ["Active", "Idle", "Running"],
    default: "Idle",
  },
});

// ✅ Automatically calculate shiftHoursPerDay before saving
scheduleSchema.pre("save", function (next) {
  const [startHour, startMinute] = this.startTime.split(":").map(Number);
  const [endHour, endMinute] = this.endTime.split(":").map(Number);

  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;

  let diff = end - start;
  if (diff < 0) diff += 24; // handles overnight shifts

  this.shiftHoursPerDay = diff;
  next();
});

const scheduleData = mongoose.model("scheduleData", scheduleSchema);
module.exports = scheduleData;
