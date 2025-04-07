const express = require("express");
const cors = require("cors");
require("dotenv").config();
const orderRoute = require("./routes/orderRoute");
const machineRoute = require("./routes/machineRoute");
const scheduleRoute = require("./routes/scheduleRoute");
const assignRoute = require("./routes/assignRoute");
require("./dataBase/dbConnect");

const app = express();
app.use(express.json());

app.use(cors());
app.use("/order", orderRoute);
app.use("/machine", machineRoute);
app.use("/schedule", scheduleRoute);
app.use("/assign", assignRoute);

app.listen(process.env.port, () => {
  console.log(`server is running on ${process.env.port}`);
});
