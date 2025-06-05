const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const loginModel = require("../models/loginModel");
router.use(express.json());

router.post("/login", async (req, res) => {
  try {
    const mentor = await loginModel.findOne({ email: req.body.email });
    if (mentor) {
      if (
        mentor.email == req.body.email &&
        mentor.password == req.body.password
      ) {
        const payload = { email: mentor.email, password: mentor.password };
        const token = jwt.sign(payload, process.env.mentorJwt, {
          expiresIn: "1h",
        });
        return res
          .status(200)
          .send({ message: "Login Successful", token: token, role: "mentor", mentorId:mentor._id });
      } else {
        return res.status(401).send({ message: "Invalid Login credentials" });
      }
    }
  } catch (error) {
    console.log("error while login", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;