import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId } from '../socket/socket.js';
import {io} from '../socket/socket.js'

export const sendMessage = async (req,res)=>{
    try{
      const {message} = req.body;
      const {id:receiverId} = req.params;
      const senderId= req.user._id;
    
      let conversation = await Conversation.findOne({
        participants : {$all : [senderId,receiverId]},
      })
      if(!conversation){
        conversation = await Conversation.create({
            participants:[senderId,receiverId],
        
        })
      }
      const newMessage = new Message({
          senderId,
          receiverId,
          message,
      })
      if(newMessage){
         conversation.message.push(newMessage._id);
      }
      
      await Promise.all([conversation.save(),newMessage.save()]);//both will run in parallel
      const receiverSocketId =  getReceiverSocketId(receiverId);
      if(receiverSocketId) {
        //io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("newMessage",newMessage)
      }

      res.status(201).json({newMessage});

    }catch(error){
        console.log("Error in send message controller",error.message);
      res.status(500).json({error : "Internal Server Error"});
    }
}

export const getMessages = async (req,res) => {
    try{
     const {id:userToChatId} = req.params;
     const senderId = req.user._id;

     const conversation = await Conversation.findOne({
        participants:{$all : [senderId,userToChatId]},

     }).populate("message"); //the messages that this conversation refers to get populated 
     if(!conversation) return res.status(200).json([]);
     const message = conversation.message;

     res.status(200).json(message);
    }catch(error){
        console.log("Error in getMessages controller",error.message);
        res.status(500).json({error : "Internal Server Error"});
    }
}