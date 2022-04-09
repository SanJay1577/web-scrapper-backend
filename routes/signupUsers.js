import express from "express";
import { User, validate } from "../models/users.js";
import bcrypt from "bcrypt";
import { Token } from "../models/token.js";
import crypto from "crypto";
import { sendEmail } from "../checkmail/sendEmail.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user = await User.find({});
  res.send(user);
});

router.post("/", async (req, res) => {
  try {
    //validating the details of the user
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    //finding wheather the user is already in the database
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ error: "User with given email already exist" });

    //genrating hashedpassword for security
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(req.body.password, salt);

    //passing the new user to the database
    user = await new User({ ...req.body, password: hashpassword }).save();

    //email verification with token

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    res
      .status(201)
      .send({ message: "An email send to your account please verify" });
  } catch (error) {
    console.log(error);
    console.log(error);
    //showcasing the error if the server has some issues
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/users/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ error: "Link Expired" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ error: "Link Expired" });
    await User.findOneAndUpdate({ email: user.email }, { verified: true });
    await token.remove();
    res.status(200).send({ message: "Verfied Sucessfully!!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOneAndDelete({ _id: id });
    if (!user) return res.status(400).send({ message: "Not a User" });
    return res.status(200).send({ message: "sucessfully Deleted" });
  } catch (error) {}
});

//exporting

export const signUpRouter = router;
