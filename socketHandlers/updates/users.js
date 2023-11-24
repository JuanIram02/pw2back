const { PrismaClient } = require('@prisma/client');
const serverStore = require('../../serverStore');

const prisma = new PrismaClient();

const updateUsers = async (userId) => {
    try{
        const users = await prisma.user.findMany({
            where: {
                NOT: [
                    { id: userId } 
                ]
            }
        })

        const receiverList = serverStore.getActiveConnections(userId);

        const io = serverStore.getSocketServerInstance();
        console.log("emite user")

        io.to(receiverList).emit('all-users', {
            users: users ? users : [],
        });

    }catch (err){
        console.log(err);
    }
};

module.exports ={
    updateUsers,
};