const { PrismaClient } = require('@prisma/client');
const chatUpdates = require("./updates/chat");

const prisma = new PrismaClient();

const directChatHistoryHandler = async (socket, data) => {
    console.log("direct chat history handler");
    try{
        const {userId} = socket.user;
        const{ receiverUserId }=data;

        const conversation = await prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        OR: [
                            { id: userId },
                            { id: receiverUserId }
                        ]
                    }
                }
            },
            select: {
                id: true
            }
        });

        if(conversation){
            chatUpdates.updateChatHistory(conversation.id.toString(), socket.id);
        }
    }catch (err){
        console.log(err);
    }
};

module.exports=directChatHistoryHandler;