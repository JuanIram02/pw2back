const { PrismaClient } = require('@prisma/client');
const express = require('express')
const auth = require('../middleware/auth');
const friendsUpdates = require("../socketHandlers/updates/friends");

const friendInvitationRoutes = express.Router()
const prisma = new PrismaClient();

friendInvitationRoutes.post("/invite",
    auth, 
    async (req, res) => {
        try{
            const {targetMailAddress} = req.body;
            const {userId, mail} = req.user;

            if(mail.toLowerCase() === targetMailAddress.toLowerCase()) {
                return res
                .status(409)
                .send('Perdón. No puedes agregarte a ti mismo a amigos');
            }

            const targetUser = await prisma.user.findUnique({
                where: {
                    email: targetMailAddress.toLowerCase(),
                },
                select: {
                    id: true,
                    friendsIds: true
                }           
            });
        
            if(!targetUser){{
                return res
                .status(404)
                .send(
                    `No se ha encontrdo ningún usuario con el siguiente correo: ${targetMailAddress}. Por favor revise el correo ingresado.`
                );
            }}

            const invitationAlreadyReceived = await prisma.friendInvitation.findMany({
                where: {
                    AND: [
                        {
                            senderId: userId,
                        },
                        {
                            receiverId: targetUser.id
                        }
                    ]
                    
                }
            }); 
        
            if(invitationAlreadyReceived.length > 0){
                return res.status(409).send('La invitación ya ha sido enviada');
            }

            const usersAlreadyFriends = await prisma.user.findMany({
                where: {
                    AND: [
                        {
                            id: userId
                        },
                        {
                            friendsIds: {
                                has: targetUser.id
                            }
                        }
                    ]
                }
            })
        
            if(usersAlreadyFriends.length > 0){
                return res
                .status(409)
                .send('Este usuario ya ha sido añadido a tu lista de amigos.');
            }

            const newInvitation = await prisma.friendInvitation.create({
                data: {
                    senderId: userId,
                    receiverId: targetUser.id
                }
            })

            return res
                .status(200)
                .send('Invitacion enviada con exito.');

        }
        catch(err){
            console.log(err)
            return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
        }
    
})

friendInvitationRoutes.post("/accept",
    auth, 
    async (req, res) => {
        try{
            const { id } = req.body;
            const { userId } = req.user;

            const invitation = await prisma.friendInvitation.findFirst({
                where: {
                    senderId: id,
                    receiverId: userId
                },
                select: {
                    id: true,
                }
            });

            if(invitation.length == 0){
                return res.status(401).send("Ha ocurrido un error. Por favor intente de nuevo");
            }
        
            const senderUser = await prisma.user.findUnique({
                where: {
                    id: id
                },
                select: {
                    friendsIds: true
                }
            })

            await prisma.user.update({
                data: {
                    friendsIds: {
                    set: [...senderUser.friendsIds, userId],
                  },
                },
                where: { id: id },
            })

            const reciverUser = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    friendsIds: true
                }
            })

            await prisma.user.update({
                data: {
                    friendsIds: {
                    set: [...reciverUser.friendsIds, id],
                  },
                },
                where: { id: userId },
            })

            await prisma.friendInvitation.delete({
                where: {
                    id: invitation.id
                }
            })

            friendsUpdates.updateFriends(id.toString());
            friendsUpdates.updateFriends(userId.toString());

            friendsUpdates.updateFriendsPendingInvitations(userId.toString());

            return res.status(200).send('Amigo añadido exitosamente');
        }
        catch(err){
            console.log(err)
            return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
        }
    }
)

module.exports = friendInvitationRoutes;