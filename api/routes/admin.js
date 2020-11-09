const express = require('express');
const router = express.Router();

const adminController = require('../Controller/admin');
const checkAuth = require('../Middleware/check-auth');

router.get('/', checkAuth, adminController.admin_get_all);

router.get('/:adminId', checkAuth, adminController.admin_get_by_id);

router.post('/signup', adminController.admin_signup);

router.post('/login', adminController.admin_login);

router.patch('/:adminId', checkAuth, adminController.admin_patch_admin);

router.delete('/:adminId', checkAuth, adminController.admin_delete_admin);

module.exports = router;