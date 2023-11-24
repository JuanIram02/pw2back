const { PrismaClient } = require('@prisma/client');
const serverStore = require('../../serverStore');

const prisma = new PrismaClient();

const updateChatHistory = async (conversationId, toSpecifiedSocketId=null)=>{
    try{

        console.log(conversationId)

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: {
                participants: true,
                messages: {
                  include: {
                    author: {
                      select: { name: true, id: true }
                    },
                    reaction: {
                        select: { content: true }
                    }
                  }
                }
            }
          });
    
        if(conversation){
            const io = serverStore.getSocketServerInstance();
    
            if(toSpecifiedSocketId){
                console.log("intial update");
                //initial update of chat history
                return io.to(toSpecifiedSocketId).emit('direct-chat-history',{
                    messages: conversation.messages,
                    participants: conversation.participants,
                });
            }
    
            // check if users of this conversation are online
    
            //if yes emit to them update of messages
    
            conversation.participants.forEach(userId =>{
                const activeConnections = serverStore.getActiveConnections(userId.toString());
    
                activeConnections.forEach(socketId =>{
                    io.to(socketId).emit('direct-chat-history',{
                        messages: conversation.messages,
                        participants: conversation.participants,
                    })
                });
            });
        }
    }catch (err){
        console.log(err);
    }

};

module.exports={
    updateChatHistory,
};