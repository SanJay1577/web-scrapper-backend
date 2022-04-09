import express from "express";
import bcrypt from "bcrypt";
import joi from "joi";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";

//login Validation

const validate = (data) => {
  const Schema = joi.object({
    email: joi.string().email().required().label("Email"),
    password: joi.string().required().label("Password"),
  });
  return Schema.validate(data);
};

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    //error handling
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    //validating user
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }
    //password validation
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).send({ error: "Invalid Credentials" });

    const authtoken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.secretkey
    );

    res.status(200).send({ message: "Login Sucessfully", token: authtoken });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

export const loginRouter = router;
