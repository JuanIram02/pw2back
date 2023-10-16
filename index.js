import { PrismaClient } from "@prisma/client";
import express from "express"
import cors from "cors"

const app = express()
const prisma = new PrismaClient();

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("hola")
})

app.post("/auth/login", async (req, res) => {
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
                password: true,
            }
        })
    
        if ( !user || password != user.password){
            return res.status(400).send('Credenciales invalidas. Por favor intente de nuevo');//400 status noo founded
        } else {
            console.log(user.id, user.email, user.name, user.password)
            return res.status(200).json({ 
                userDetails:{
                    id: true,
                    mail: user.email,
                    username: user.name,
                    id: user.id,
                }
            })
        }
    }
    catch(err){
        return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
    }
    
})

app.post("/auth/register", async (req, res) => {
    
    try{
        const {name, lastname, mail, password} = req.body
            console.log(name, lastname, mail, password)

        const newUser = await prisma.user.create({
            data: {
                name: name,
                lastname: lastname,
                email: mail,
                password: password
            }
        })

        console.log(newUser)
        if(newUser){
            return res.status(200).send('Usuario creado correctamente');
        }
    }
    catch(err){
        return res.status(500).send('Algo salió mal. Por favor intente de nuevo');
    }

})

app.listen(5002, () =>{
    console.log("Server is listinig the port 5002")
})
