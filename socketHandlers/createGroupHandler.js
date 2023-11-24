const { PrismaClient } = require('@prisma/client');
const groupsUpdate = require('./updates/groups');

const prisma = new PrismaClient()

const createGroupHandler = async (socket, data) => {
    try{
        console.log('creating group');
        const {userId} = socket.user;

        const {name, participants, isPublic} = data;

        if(!isPublic){
            // Get all user documents that match the given email addresses
            const participantEmails = [...participants];

            const participantDocs = await prisma.user.findMany({
                where: {
                  mail: {
                    in: participantEmails,
                  },
                },
              });

            // Extract the participant IDs from the user documents
            const participantIds = participantDocs.map(doc => doc.id);
            participantIds.push(userId);

            //create group
            const group = await prisma.group.create({
                data: {
                  name: name,
                  isPublic: isPublic,
                  participants: {
                    connect: participantIds.map(participantId => ({ id: participantId })),
                  },
                  messages: {
                    create : []
                  },
                },
            });

            for (const participantId of participantIds) {
                groupsUpdate.updateGroups(participantId.toString());
            };
        }else{
            console.log(name);
            const group = await prisma.group.create({
                data: {
                  name: name,
                  messages: {
                    create : []
                  },
                  isPublic: isPublic,
                },
            });
              
            const users = await prisma.user.findMany();
            //console.log(users);

            for (const user of users) {
                //console.log(user.id);
                groupsUpdate.updateGroups(user.id.toString());
            };
        }
        

    }catch(err){
        console.log(err);
    }
};

module.exports=createGroupHandler;