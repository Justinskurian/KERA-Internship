const express = require("express");
const router = express.Router();
const scheduleModel = require("../models/scheduleModel");
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    const data = await scheduleModel.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("Unable to find data");
  }
});

router.post("/add", async (req, res) => {
  try {
    const item = req.body;
    const data = new scheduleModel(item);
    await data.save();
    res.status(201).json({ message: "Data added", data });
  } catch (error) {
    res.status(400).json({ message: "Couldn't add data", error: error.message });
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    await scheduleModel.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).send("Data updated successfully");
  } catch (error) {
    res.status(500).send("Update failed");
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await scheduleModel.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted successfully");
  } catch (error) {
    res.status(500).send("Couldn't delete");
  }
});

// ✅ NEW: Increase machine capacity by reducing time_per_product
router.put("/increaseCapacity/:id", async (req, res) => {
  try {
    const { increaseByPercentage } = req.body;
    const machine = await scheduleModel.findById(req.params.id);

    if (!machine || !machine.time_per_product) {
      return res.status(404).json({ message: "Machine or time_per_product not found" });
    }

    const currentTimePerProduct = machine.time_per_product;
    const reducedTimePerProduct =
      currentTimePerProduct * (1 - increaseByPercentage / 100);

    machine.time_per_product = parseFloat(reducedTimePerProduct.toFixed(4));
    await machine.save();

    res.status(200).json({
      message: `Capacity increased by ${increaseByPercentage}%`,
      new_time_per_product: machine.time_per_product,
      new_capacity: (1 / machine.time_per_product).toFixed(2) + " units/hr"
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to increase capacity", error: error.message });
  }
});

module.exports = router;
