//import React from 'react';

import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
    const [loading,setLoading] = useState(false);
    const {messages,setMessages,selectedConversation} = useConversation();
    
    const sendMessage = async (message) =>{
           setLoading(true);
          try {
             const res = await fetch(`/api/messages/send/${selectedConversation._id}`,{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message})
             })
             const data = await res.json();
             
             
             //console.log("data",Data);
             if(data.error) throw new Error(data.error);
             const Data = data.newMessage;

             setMessages([...messages,Data])
          } catch (error) {
            toast.error(error.message);
          } finally {
             setLoading(false);
          }

    }

    return {sendMessage,loading};
}

export default useSendMessage;
