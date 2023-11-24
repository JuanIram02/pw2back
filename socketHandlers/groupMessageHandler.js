const { PrismaClient } = require('@prisma/client');
const groupUpdates = require('./updates/groups');

const prisma = new PrismaClient();

const groupMessageHandler = async (socket, data) =>{
    try{
        console.log('group message event is being handled');

        const { userId } = socket.user;
        const {groupId, content} = data;

        //create new message
        const message = await prisma.message.create({
            data: {
              content: content,
              author: {
                connect: {
                  id: userId,
                },
              },
              date: new Date(),
              type: 'GROUP',
            },
          })


        //find if conversation exist with this two users - if not create new
        const group = await prisma.group.findUnique({
            where: {
              id: groupId
            }
        })

        if(group){
            const group = await prisma.group.update({
                where: {
                  id: groupId,
                },
                data: {
                  messages: {
                    connect: {
                      id: message.id,
                    },
                  },
                },
              });

            // perform and update to sender and receiver if is online
            groupUpdates.updateGroupHistory(group.id.toString());
        }

    }catch (err){
        console.log(err);
    }
};

module.exports = groupMessageHandler;