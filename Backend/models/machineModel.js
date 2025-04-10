const mongoose = require("mongoose");

const machineSchema = mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  process: { type: String, required: true },
  batch_size: { type: Number, required: true },
  timeForOneBatch: { type: Number, required: true },
  time_per_product: { type: Number, required: true },
  unit_material_per_product: { type: Number, required: true },
  efficiency: { type: Number },
  end_time: { type: Date },
  start_time: { type: Date },
  components: [
    {
      name: { type: String, required: true },
      quantity_per_kg: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
});

// Pre-save middleware to calculate efficiency before saving
machineSchema.pre("save", function (next) {
  this.efficiency = this.batch_size / this.time;
  next();
});

const machineData = mongoose.model("machineData", machineSchema);
module.exports = machineData;
