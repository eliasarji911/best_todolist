const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {addUser,getByUserName,getByEmail} = require('../model/users_M');

async function register(req,res) {
    try{
        let name = req.body.name;
        let email = req.body.email;
        let userName = req.body.userName;
        let pass = req.pass;

        let user = await getByUserName(userName);
        if(user){
            return res.status(409).json({message:"שם משתמש קיים במערכת"});
        }
        user = await getByEmail(email);
        if(user){
            return res.status(409).json({message:"אימייל קיים במערכת"});
        }

        let userId = await addUser({name,email,userName,pass});
        if(!userId){
            return res.status(500).json({message:"Server error"});
        }
        res.status(201).json({message:"נוסף בהצלחה"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
}

async function login(req,res,next) {
    try{
        let user = await getByUserName(req.body.userName);
        if(!user){
            return res.status(400).json({message:"שם משתמש או סיסמה שגויים"});
        }
        let isMatch = await bcrypt.compare(req.body.pass,user.pass);
        if(!isMatch){
            return res.status(400).json({message:"שם משתמש או סיסמה שגויים"});
        }
        req.user = user;
        next();
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
}

function createJwt(req,res) {
    try{
        let user = req.user;
        let token = jwt.sign(
            {id:user.id,name:user.name},
            process.env.SECRET_KEY,
            {expiresIn:'3h'}
        );
        res.cookie('jwt',token,{httpOnly:true,maxAge:1000*60*60*3}).status(200).json({message:"התחברת בהצלחה",name:user.name});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
}

module.exports ={
    register,
    login,
    createJwt
}