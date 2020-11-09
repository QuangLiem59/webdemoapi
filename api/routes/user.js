const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../Models/User');
const userController = require('../Controller/user');
const checkAuth = require('../Middleware/check-auth');

router.get('/', userController.user_get_all);

router.get('/refeshtoken', userController.user_refesh_token);

router.post('/signup', userController.user_signup);

router.post('/login', userController.user_login);

router.get('/logout', userController.user_logout);

router.delete('/:userId', userController.user_delete_user);

router.get('/infor', checkAuth, userController.user_get_infor);

router.patch('/:userId', checkAuth, userController.user_patch_user);

module.exports = router;