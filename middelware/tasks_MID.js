function valuesToAdd(req,res,next){
    let text = req.body.text;
    if(!text){
        return res.status(400).json({message:"חסרים נתונים"});
    }
    next();
}

function isValidId(req,res,next){
    let id = parseInt(req.params.id);
    if(isNaN(id) || id <= 0){
        res.status(400).json({message:"ID is not valid"})
    }
    req.id = id;
    next();
}

function valuesToEdit(req,res,next){
    let obj = {};
    if(req.body.text){
        obj.text = req.body.text;
    }
    if(req.body.isDone != undefined){
        obj.is_done = req.body.isDone;
    }
    let keys = Object.keys(obj);
    if(keys.length === 0){
        return res.status(400).json({message:"חסרים פרמטרים"})
    }
    
    req.newTask = obj;
    next();
}

module.exports = {
    valuesToAdd,
    isValidId,
    valuesToEdit
}