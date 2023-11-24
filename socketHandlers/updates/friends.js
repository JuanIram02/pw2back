const { PrismaClient } = require('@prisma/client');
const serverStore = require('../../serverStore');

const prisma = new PrismaClient();

const updateFriendsPendingInvitations = async (userId) => {
    try{
        const pendingInvitationsIds = await prisma.friendInvitation.findMany({
            where: {
                receiverId: userId
            },
            select: {
                senderId: true
            }
        })
        
        const userIds = pendingInvitationsIds.map(user => user.senderId);

        const pendingInvitations = await prisma.user.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        })

        const receiverList = serverStore.getActiveConnections(userId);

        const io = serverStore.getSocketServerInstance();

        receiverList.forEach(receiverSocketId => {
            io.to(receiverSocketId).emit('friends-invitations', {
                pendingInvitations: pendingInvitations ? pendingInvitations : [],
            });
        });
    }catch (err){
        console.log(err);
    }
};

const updateFriends = async (userId) => {
    try{
        //find active connections of specific id (online users)
        const receiverList = serverStore.getActiveConnections(userId);

        if(receiverList.length > 0){

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    friendsIds: true
                }
            })

            if(user){

                const friendsList = await prisma.user.findMany({
                    where: {
                        id: { in: user.friendsIds }
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                })

                //get io server instance
                const io = serverStore.getSocketServerInstance();

                receiverList.forEach(receiverSocketId =>{
                    io.to(receiverSocketId).emit('friends-list', {
                        friends: friendsList ? friendsList : [],
                    });
                });
            }
        }
    }catch (err){
        console.log(err);
    }
};

module.exports ={
    updateFriendsPendingInvitations,
    updateFriends,
};