import { Flipkart } from "../models/flipkart.js";
import validUrl from "valid-url";
import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import jwt from "jsonwebtoken";
import { User } from "../models/users.js";
import { sendEmail } from "../checkmail/sendEmail.js";

const router = express.Router();

//get all details....

router.get("/", async (req, res) => {
  try {
    const msg = "Your Product is at a buyable rate";
    const token = req.headers["x-auth-token"];
    const decode = jwt.verify(token, process.env.secretkey);
    //finding the specific user from token

    const user = await User.findOne({ _id: decode._id });
    if (!user)
      return res.status(400).send({ message: "Invalid Authorisation" });

    const scrapeIDs = user.flipkartScrape;
    //finding the amazon scrape _id's and getting the data..

    let flipkart = await Flipkart.find({ _id: { $in: scrapeIDs } });

    flipkart
      ? flipkart.map(async (item) => {
          if (item.productPrice < item.buyPrice) {
            await Flipkart.findOneAndUpdate(
              { _id: item._id },
              { $set: { isLower: true } },
              { new: true }
            );
            await sendEmail(
              user.email,
              "Time to Buy",
              `${msg}  ${item.productUrl}`
            );
          } else
            await Flipkart.findOneAndUpdate(
              { _id: item._id },
              { $set: { isLower: false } },
              { new: true }
            );
          return;
        })
      : "";

    //sending the response as a array of object...

    return res.status(200).send({ user: user.username, data: flipkart });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// post a new flipkart product to the user data

router.post("/", async (req, res) => {
  try {
    const url = await req.body.url;
    const price = await req.body.price;
    const valid = validUrl.isUri(url);
    if (!valid)
      return res.status(400).send({ error: "please provide valid url" });

    const token = req.headers["x-auth-token"];
    const decode = jwt.verify(token, process.env.secretkey);
    const user = await User.findOne({ _id: decode._id });
    if (!user) return res.status(400).send({ error: "Invalid Authorisation" });

    //cheerio method to scrape the data

    const data = await axios
      .get(url)
      .then(async (res) => {
        const currencyStringToNumber = (currency) =>
          Number(currency.replace(/[^0-9.-]+/g, ""));

        const $ = cheerio.load(res.data);
        const productName = $("h1.yhB1nd span.B_NuCI")
          .text()
          .trim()
          .replace(/\s/g, "");
        const ProductPrice = $("div._30jeq3._16Jk6d").text().trim();
        const currentPrice = currencyStringToNumber(ProductPrice);
        const ProductImage = $("div._3nMexc img._2amPTt").attr();
        const productUrl = ProductImage === undefined ? "" : ProductImage.src;

        let flipkart = await new Flipkart({
          productName: productName,
          productPrice: currentPrice,
          buyPrice: price,
          productImage: productUrl,
          productUrl: url,
        }).save();   

        await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { flipkartScrape: flipkart._id } }
        );
        return flipkart;
      })
      .catch((err) => console.log(err));

    //assinging a new product details from scraped data

    const newProduct = await data;

    return res
      .status(200)
      .send({ message: "Sucessfully Added", data: newProduct });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

//delete a specific user through params id

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const token = req.headers["x-auth-token"];
    const decode = jwt.verify(token, process.env.secretkey);
    const user = await User.findOne({ _id: decode._id });
    if (!user)
      return res.status(400).send({ message: "Invalid Authorisation" });

    //getting the deteleted product id out from the user details

    const flipkart = await Flipkart.findOne({ _id: id });
    if (!flipkart) return res.status(400).send({ message: "No data Found" });
    await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { flipkartScrape: id } }
    );
    await Flipkart.deleteOne({ _id: id });
    return res.status(200).send({ message: "Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

//edit  a specific user through params id

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const buyPrice = req.body.buyPrice;
    let flipkart = Flipkart.findOne({ _id: id });
    if (!flipkart)
      return res.status(400).send({ error: "No Product available" });

    //method to edit the product price.

    const update = await Flipkart.findOneAndUpdate(
      { _id: id },
      { $set: { buyPrice: buyPrice } },
      { new: true }
    );
    return res
      .status(200)
      .send({ message: "Updated Sucessfully", data: update });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server error" });
  }
});

export const flipkartRouter = router;
