const mongoose=require("mongoose");
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},title:{type:String,required:true},message:{type:String,required:true},complaint:{type:mongoose.Schema.Types.ObjectId,ref:"Complaint"},read:{type:Boolean,default:false}},{timestamps:true});
module.exports=mongoose.model("Notification",schema);
