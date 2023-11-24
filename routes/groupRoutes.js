const { PrismaClient } = require('@prisma/client');
const express = require('express')
const auth = require('../middleware/auth');

const groupRoutes = express.Router()
const prisma = new PrismaClient();

groupRoutes.post(
    '/create-group',
    auth,
    async (req, res) => {
        try{
            console.log(req.body);

            const {userId} = socket.user;
            return res.send('create group handler');
        }
        catch(err){
            console.log(err)
            return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
        }
    }
)
