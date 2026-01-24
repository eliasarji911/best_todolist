const {getAll,getOne,remove,update} = require('../model/users_M.js');

async function getAllUsers(req,res) {
    try{
        let users = await getAll();
        if(users.length == 0){
            return res.status(400).json({message:"אין נתונים"})
        }
        res.status(200).json(users)
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

async function getOneUser(req,res) {
    try{
        let user = await getOne(req.id);
        if(!user){
            return res.status(400).json({message:`User ${req.id} not found!`})
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

async function deleteUser(req,res) {
    try{
        let affectedRows = await remove(req.id);
        if(!affectedRows){
            return res.status(400).json({message:`User ${req.id} not found!`})
        }
        res.status(200).json({message:"deleted!"});
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

async function updateUser(req,res) {
    try{
        let affectedRows = await update(req.id,req.user);
        if(!affectedRows){
            return res.status(400).json({message:`User ${req.id} not found!`})
        }
        res.status(200).json({message:"updated!"});
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

module.exports={
    getAllUsers,
    getOneUser,
    deleteUser,
    updateUser
}