const mongoose = require("mongoose");

const scheduleSchema = mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    unique: true,
  },
  process: {
    type: String,
    required: true,
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Idle"],
    required: true,
  },
});

const scheduleData = mongoose.model("scheduleData", scheduleSchema);
module.exports = scheduleData;
