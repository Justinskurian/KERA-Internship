const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  name: String,
  email:{ type:String, unique: true},
  phone: Number,
  password: String,
});

const login = mongoose.model("login", loginSchema);
module.exports = login;