import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import joi from 'joi';
import passwordComplexity from 'joi-password-complexity'; 

const userSchema = new mongoose.Schema({
    
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    verified:{type:Boolean,default:false},
    amazonScrape:[ObjectId],
    flipkartScrape:[ObjectId],
});

const User = mongoose.model("user",userSchema);

const validate = (data)=>{
    const schema = joi.object({
        username:joi.string().required().label("Username"),
        email:joi.string().email().required().label("Email"),
        password:passwordComplexity().required().label("Password"),
    });
    return schema.validate(data)
}
export {User,validate};