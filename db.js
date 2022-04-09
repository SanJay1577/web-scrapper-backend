import mongoose from "mongoose";

export function MongoConnect() {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(process.env.mongoUrl, connectionParams);
    console.log("Mongo db is connected");
  } catch (error) {
    console.log(error);
  }
}
