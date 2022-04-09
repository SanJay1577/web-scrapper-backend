import jwt from "jsonwebtoken";
//authentication function

export const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.secretkey);
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: "Invalid authentication" });
  }
};
