const Admin = require('../Models/Admin');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.admin_get_all = (req, res, next) => {
    Admin.find()
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                admins: result.map(docs => {
                    return {
                        adminData: docs,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:2228/admin/' + docs._id
                        }
                    }
                }),
            }
            if (result.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: 'Nothing'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}

exports.admin_get_by_id = (req, res, next) => {
    const adminId = req.params.adminId;
    Admin.findById(adminId)
        .select('-__v')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    admin: result,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:2228/admin'
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No Data From Id'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}

exports.admin_signup = (req, res, next) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(admin => {
            if (admin.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const admin = new Admin({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            adminname: req.body.adminname,
                            password: hash
                        });
                        admin
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'Add User Successful',
                                    addAdmin: result,
                                    request: {
                                        type: 'GET',
                                        url: 'http://localhost:2228/Admin/' + result._id
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
}

exports.admin_login = (req, res, next) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(admin => {
            if (admin.length < 1) {
                return res.status(404).json({
                    message: 'Mail not found , admin doesn\'t exist'
                })
            }
            bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: admin[0].email,
                            adminname: admin[0].adminname,
                            adminId: admin[0]._id
                        },
                        'secret',
                        {
                            expiresIn: '1h'
                        }
                    )
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                console.log(req.body.password, admin[0].password);
                return res.status(401).json({
                    message: 'Auth failedd'
                });
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

exports.admin_delete_admin = (req, res, next) => {
    Admin.remove({ _id: req.params.adminId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Admin Deleted'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.admin_patch_admin = (req, res, next) => {
    const adminId = req.params.adminId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Admin.find({ email: updateOps.email })
        .exec()
        .then(admin => {
            if (admin.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                Admin.updateOne({ _id: adminId }, { $set: updateOps })
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: 'Admin Updated',
                            admin: result,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:2228/user/' + adminId
                            }
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
            }
        })
}