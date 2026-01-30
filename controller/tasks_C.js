const {getAll,add,getOne,remove,update} = require('../model/tasks_M.js');

async function getAllTasks(req,res) {
    try{
        let tasks = await getAll(req.user.id);
        if(tasks.length == 0){
            return res.status(400).json({message:"אין נתונים"})
        }
        res.status(200).json(tasks)
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

async function addTask(req,res) {
    try{
        let text = req.body.text;
        let userId = req.user.id;
        let catId = req.body.catId || null;

        let taskId = await add({text,userId,catId});
        if(!taskId){
            return res.status(500).json({message:"Server error"});
        }
        res.status(201).json({message:"נוסף בהצלחה"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"});
    }
}

async function getTask(req,res) {
    try{
        let task = await getOne(req.id,req.user.id);
        if(!task){
            return res.status(400).json({message:`task is not found!`})
        }
        res.status(200).json(task);
    }catch(err){
        res.status(500).json({message:"Server error"})
    }
}

async function deleteTask(req,res) {
    try{
        let affectedRows = await remove(req.id,req.user.id);
        if(!affectedRows){
            return res.status(400).json({message:`task ${req.id} not found!`})
        }
        res.status(200).json({message:"deleted!"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server error"})
    }
}

async function editTask(req,res) {
    try{
        let taskId = req.id;
        let userId = req.user.id;
        let newTask = req.newTask;

        let affectedRows = await update(taskId,userId,newTask);
        if(!affectedRows){
            return res.status(400).json({message:`Task ${req.id} not found!`})
        }
        res.status(200).json({message:"updated!"});
    }catch(err){
        console.error(err);
        
        res.status(500).json({message:"Server error"})
    }
}

module.exports={
    getAllTasks,
    addTask,
    getTask,
    deleteTask,
    editTask
}