const { PrismaClient } = require('@prisma/client');
const express = require('express')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRoutes = express.Router()
const prisma = new PrismaClient();

authRoutes.post("/login", async (req, res) => {
    try{
        const {mail, password} = req.body;
        console.log(mail, password)
    
        const user = await prisma.user.findUnique({ 
            where: {
                email: mail
            },
            select: {
                id: true,
                email: true,
                name: true,
                password: true
            }
        })
    
        if ( !user || password != user.password){
            return res.status(400).send('Credenciales invalidas. Por favor intente de nuevo');//400 status noo founded
        } else {
            //console.log(user.id, user.email, user.name, user.password)
            const token= jwt.sign(
                {
                    userId: user.id,
                    mail
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '24h'
                }
            );

            return res.status(200).json({ 
                userDetails:{
                    mail: user.email,
                    token:token,
                    username: user.name,
                    _id: user.id,
                }
            })
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
    }
    
})

authRoutes.post("/register", async (req, res) => {
    
    try{
        const {name, lastname, mail, password} = req.body
            //console.log(name, lastname, mail, password)

        const newUser = await prisma.user.create({
            data: {
                name: name,
                lastname: lastname,
                email: mail,
                password: password
            }
        })

        //console.log(newUser)
        if(newUser){
            const token= jwt.sign(
                {
                    userId: newUser.id,
                    mail
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '24h'
                }
            );
    
            //here send the responde to the client
            return res.status(201).json({ 
                userDetails:{
                    mail: newUser.email,
                    token:token,
                    username: newUser.name,
                    _id: newUser.id,
                }
            })
        }
    }
    catch(err){
        return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
    }

})

module.exports = authRoutes;