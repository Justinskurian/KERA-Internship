var mongoose = require("mongoose");
mongoose
  .connect(process.env.mongo_url)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log("could not connect to Database");
  });
