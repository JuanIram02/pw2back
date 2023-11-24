const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next)=>{
    let token = req.body.token || req.query.token || req.headers['authorization'];

    if(!token){
        return res.status(403).send('El requerido un token para autenticación')//403 forbidden status
    }
    try{
        token = token.replace(/^Bearer\s+/, "") //this gonna remove the token secret and just let the normal token
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    }
    catch(err)
    {
        return res.status(401).send('Token invalido');
    }
    return next();//if the tooken is still valid because we have 24 hrs it just will coontinue
};

module.exports = verifyToken;