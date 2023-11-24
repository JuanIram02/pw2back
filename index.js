const express = require('express');
const http = require('http');
const cors = require('cors');

const socketServer= require('./socketServer');
const authRoutes = require('./routes/authRoutes')
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes);
app.use('/friend-invitation', friendInvitationRoutes);

const server = http.createServer(app); //create the server
socketServer.registerSocketServer(server);

server.listen(5002,()=>{
    console.log(`Server is listening on 5002`);
}); //start the server
