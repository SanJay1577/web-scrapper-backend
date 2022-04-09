
import mongoose from "mongoose";

//Schema initialization
const flipkartSchema = new mongoose.Schema({
    productName:{type:String, required:true},
    productPrice:{type:Number, required:true},
    buyPrice:{type:Number, required:true},
    productImage:{type:String, required:true},
    productUrl:{type:String, required:true},
    isLower:{type:Boolean, default:false, required:true}
})

//Model initialization
const Flipkart  = mongoose.model("flipkart", flipkartSchema)      
export {Flipkart}; 