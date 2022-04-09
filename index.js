import express from "express";
import { MongoConnect } from "./db.js";
import dotenv from "dotenv";
import cors from "cors";
import { amazonRouter } from "./routes/amazonProducts.js";
import { flipkartRouter } from "./routes/flipkartProducts.js";
import { signUpRouter } from "./routes/signupUsers.js";
import { loginRouter } from "./routes/loginUser.js";
import { auth } from "./auth.js";
import { passwordResetRouter } from "./routes/passswordReset.js";
import { DashRouter } from "./routes/dashBoad.js";

//dot env configuration for it's use
dotenv.config();

const app = express();
const PORT = process.env.PORT;

//Mongo connection
MongoConnect();
//Middle ware
app.use(express.json());
app.use(cors());

//secured route with authentication
app.use("/amazon", auth, amazonRouter);
app.use("/flipkart", auth, flipkartRouter);
app.use("/dash", auth, DashRouter);

//user creation Route
app.use("/signup", signUpRouter);
app.use("/login", loginRouter);
app.use("/reset", passwordResetRouter);

app.listen(PORT, () => console.log(`App workin in localhost:${PORT}`));
