const express = require("express");
const cors = require("cors");
require("dotenv").config();
const orderRoute = require("./routes/orderRoute");
const machineRoute = require("./routes/machineRoute");
const scheduleRoute = require("./routes/scheduleRoute");

require("./dataBase/dbConnect");

const app = express();

app.use(cors());
app.use("/order", orderRoute);
app.use("/machine", machineRoute);
app.use("/schedule", scheduleRoute);

app.listen(process.env.port, () => {
  console.log(`server is running on ${process.env.port}`);
});
