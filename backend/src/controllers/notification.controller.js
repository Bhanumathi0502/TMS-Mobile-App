const Notification=require("../models/Notification");
exports.list=async(req,res,next)=>{try{const data=await Notification.find({user:req.user._id}).populate("complaint","complaintType status priority").sort({createdAt:-1}).limit(100);res.json({data,unread:data.filter(x=>!x.read).length});}catch(e){next(e)}};
exports.read=async(req,res,next)=>{try{await Notification.updateOne({_id:req.params.id,user:req.user._id},{$set:{read:true}});res.json({message:"Notification marked as read"});}catch(e){next(e)}};
exports.readAll=async(req,res,next)=>{try{await Notification.updateMany({user:req.user._id,read:false},{$set:{read:true}});res.json({message:"Notifications marked as read"});}catch(e){next(e)}};
