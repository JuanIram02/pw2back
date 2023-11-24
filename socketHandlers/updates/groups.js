const { PrismaClient } = require('@prisma/client');
const serverStore = require('../../serverStore');

const prisma = new PrismaClient();

const updateGroups = async (userId) => {
    try{
        //find active connections of specific id (online users)
        const receiverList = serverStore.getActiveConnections(userId);

        if(receiverList.length > 0){

            const groups = await prisma.group.findMany({
                where: {
                  OR: [
                    { participants: { some: { id: userId } } },
                    { participants: { none: {} } },
                  ],
                },
              });

            if(groups){
                const groupsList = groups.map(g => {
                    return {
                        id: g.id,
                        name: g.name,
                    };
                });

                //get io server instance
                const io = serverStore.getSocketServerInstance();

                receiverList.forEach(receiverSocketId =>{
                    io.to(receiverSocketId).emit('groups-list', {
                        groups: groupsList ? groupsList : [],
                    });
                });
            }
        }
    }catch (err){
        console.log(err);
    }
};

const updateGroupHistory = async (groupId, toSpecifiedSocketId=null) => {
    const group = await prisma.group.findUnique({
        where: {
          id: groupId,
        },
        include: {
          messages: {
            include: {
              author: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

    if(group){
        const io = serverStore.getSocketServerInstance();

        if(toSpecifiedSocketId){
            //initial update of chat history
            return io.to(toSpecifiedSocketId).emit("group-chat-history",{
                id: group.id,
                messages: group.messages,
                participants:group.participants,
            });
        }

        //check if users of this conversation are online
        //if yes emit to them update of messages
        if(!group.isPublic){
            group.participants.forEach(userId=>{
                const activeConnections= serverStore.getActiveConnections(userId.toString());
    
                activeConnections.forEach(socketId =>{
                    io.to(socketId).emit('group-chat-history',{
                        id: group.id,
                        messages: group.messages,
                        participants:group.participants,
                    });
                });
            });
        }else{
            const users = await prisma.User.findMany();

            users.forEach(user=>{
                const activeConnections= serverStore.getActiveConnections(user.id.toString());
    
                activeConnections.forEach(socketId =>{
                    io.to(socketId).emit('group-chat-history',{
                        id: group.id,
                        messages: group.messages,
                        participants:group.participants,
                    });
                });
            });
        }
        
    }
};

module.exports ={
    updateGroups,
    updateGroupHistory,
};