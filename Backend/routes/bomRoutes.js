const express = require("express");
const router = express.Router();
const BOM = require("../models/bomModel")

// Get all BOMs
router.get("/", async (req, res) => {
    try {
      const boms = await BOM.find();
      res.status(200).json(boms);
    } catch (error) {
      console.error("Error fetching BOMs:", error);
      res.status(500).json({ error: error.message });
    }
  });

// Create a new BOM
router.post("/add", async (req, res) => {
    try {
      const newBOM = new BOM(req.body);
      const savedBOM = await newBOM.save();
      res.status(201).json(savedBOM);
    } catch (error) {
      console.error("Error creating BOM:", error);
      res.status(400).json({ error: error.message });
    }
  });

// Delete BOM by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await BOM.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "BOM not found" });
    }
    res.status(200).json({ message: "BOM deleted successfully" });
  } catch (error) {
    console.error("Error deleting BOM:", error);
    res.status(500).json({ error: error.message });
  }
});

  
  
module.exports = router;