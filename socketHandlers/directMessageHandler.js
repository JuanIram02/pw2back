const { PrismaClient } = require('@prisma/client');
const chatUpdates = require('./updates/chat');

const prisma = new PrismaClient();

const directMessageHandler = async (socket, data) =>{
    try{
        console.log('direct message event is being handled');

        const { userId } = socket.user;
        const { receiverUserId, content}=data;

        //create new message
        const reaction = await prisma.reaction.create({
            data: {
              user: {
                connect: {
                  id: userId
                }
              },
              content: ""
            }
          });
          
          const message = await prisma.message.create({
            data: {
              content: content,
              author: {
                connect: {
                  id: userId
                }
              },
              date: new Date(),
              type: 'DIRECT',
              reaction: {
                connect: {
                  id: reaction.id
                }
              }
            }
          });

        //find if conversation exist with this two users - if not create new
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
            await prisma.conversation.update({
                where: { 
                    id: conversation.id
                 },
                data: {
                  messages: {
                    connect: { id: message.id } 
                  }
                }
            });

            // perform and update to sender and receiver if is online
            chatUpdates.updateChatHistory(conversation.id.toString());
        }else{
            //create new conversation
            const newConversation = await prisma.conversation.create({
                data:{
                    messages: {
                        connect: { id: message.id }
                    },
                    participants: {
                        connect: [
                            { id: userId },
                            { id: receiverUserId }
                        ]
                    }
                }            
            });

            //perform and update to sender and receiver if is online
            chatUpdates.updateChatHistory(newConversation.id.toString());
        }

    }catch (err){
        console.log(err);
    }
};

module.exports = directMessageHandler;