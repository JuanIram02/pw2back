const { PrismaClient } = require('@prisma/client');
const groupUpdates = require("./updates/groups.js");

const prisma = new PrismaClient();

const groupChatHistoryHandler = async (socket, data) => {
    try{
        const {userId} = socket.user;
        const{ groupReceiverId } = data;

        const group = await prisma.group.findUnique({
            where: {
              id: groupReceiverId,
            },
          });

        if(group){
            //console.log("if group");
            groupUpdates.updateGroupHistory(group.id.toString(), socket.id);
        }
    }catch (err){
        console.log(err);
    }
};

module.exports=groupChatHistoryHandler;