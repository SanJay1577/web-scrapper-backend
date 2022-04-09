import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/users.js";

const router = express.Router();

//get user name from token

router.get("/", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const decode = jwt.verify(token, process.env.secretkey);
    const user = await User.findOne({ _id: decode._id });
    if (!user) return res.status(400).send({ error: "Invalid Authorisation" });

    return res.status(200).send({ user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const DashRouter = router;
