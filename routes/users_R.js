const express = require('express');
const router = express.Router();
const {getAllUsers,getOneUser,deleteUser,updateUser} = require('../controller/user_C.js');
const {isValidId,valuesToEdit} = require('../middelware/users_MID');
const {isLoggedIn} = require('../middelware/auth_MID');

router.get('/',isLoggedIn,getAllUsers);
router.get('/:id',isValidId,getOneUser);
router.delete('/:id',isValidId,deleteUser);
router.patch('/:id',isValidId,valuesToEdit,updateUser);

module.exports = router;