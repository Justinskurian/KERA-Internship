const express = require("express");
const router = express.Router();
const scheduleModel = require("../models/scheduleModel");
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    var data = await scheduleModel.find();
    res.status(200).send(data);
  } catch (error) {
    res.send("unable to find data");
  }
});

router.post("/add", async (req, res) => {
  try {
    var item = req.body;
    var data = await scheduleModel(item).save();
    res.status(200).send({ message: "Data added" });
  } catch (error) {
    res.send("Couldn't add data");
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    await scheduleModel.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).send("Data updated successfully");
  } catch (error) {
    res.send(error);
  }
});

  router.delete("/delete/:id", async (req,res)=>{
    try {
        await scheduleModel.findByIdAndDelete(req.params.id)
        res.status(200).send("Deleted successfully")
    } catch (error) {
        res.send("couldn't delete")
    }
  })

module.exports = router;
