const User = require('../Models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.user_get_all = (req, res, next) => {
    User.find()
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                users: result.map(docs => {
                    return {
                        userData: docs,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:2228/user/' + docs._id
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

exports.user_get_infor = (req, res, next) => {
    const userId = req.userData.userId;
    User.findById(userId)
        .select('-__v -password')
        .exec()
        .then(result => {
            if (result) {
                return res.status(200).json({
                    user: result,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:2228/user'
                    }
                })
            } else {
                return res.status(404).json({
                    message: 'No Data From Id'
                })
            }
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        })
}

exports.user_signup = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                if (req.body.password.length < 6) {
                    return res.status(400).json({ message: 'Password is least 6 characters long' });
                }
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            username: req.body.username,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                const AccessToken = jwt.sign(
                                    {
                                        email: user.email,
                                        username: user.username,
                                        userId: user._id
                                    },
                                    process.env.JWT_ACCESS_TOKEN_KEY,
                                    {
                                        expiresIn: '1d'
                                    }
                                );
                                const RefeshToken = jwt.sign(
                                    {
                                        email: user.email,
                                        username: user.username,
                                        userId: user._id
                                    },
                                    process.env.JWT_REFESH_TOKEN_KEY,
                                    {
                                        expiresIn: '7d'
                                    }
                                );

                                res.cookie("RefeshToken", RefeshToken);

                                return res.status(201).json({
                                    message: 'Add User Successful',
                                    addUser: result,
                                    request: {
                                        type: 'GET',
                                        url: 'http://localhost:2228/user/' + result._id
                                    },
                                    AccessToken
                                })
                            })
                            .catch(err => {
                                return res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
}

exports.user_refesh_token = (req, res, next) => {
    try {
        const rtk = req.cookies.RefeshToken;
        if (!rtk) return res.status(400).json({ message: "Please login or register" })
        jwt.verify(rtk, process.env.JWT_REFESH_TOKEN_KEY, (err, user) => {
            if (err) return res.status(400).json({ message: "Please login or register" });
            const AccessToken = jwt.sign(
                {
                    email: user.email,
                    username: user.username,
                    userId: user.userId
                },
                process.env.JWT_ACCESS_TOKEN_KEY,
                {
                    expiresIn: '1d'
                }
            );
            return res.status(200).json({
                AccessToken,
                user
            })
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err
        })
    }
}

exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: 'Mail not found , user doesn\'t exist'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const AccessToken = jwt.sign(
                        {
                            email: user[0].email,
                            username: user[0].username,
                            userId: user[0]._id
                        },
                        process.env.JWT_ACCESS_TOKEN_KEY,
                        {
                            expiresIn: '1d'
                        }
                    );
                    const RefeshToken = jwt.sign(
                        {
                            email: user[0].email,
                            username: user[0].username,
                            userId: user[0]._id
                        },
                        process.env.JWT_REFESH_TOKEN_KEY,
                        {
                            expiresIn: '7d'
                        }
                    );
                    res.cookie('RefeshToken', RefeshToken);
                    return res.status(200).json({
                        message: 'Auth successful',
                        AccessToken
                    });
                }
                return res.status(401).json({
                    message: 'Auth failedd'
                });
            })
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            })
        })
}

exports.user_logout = (req, res, next) => {
    try {
        res.clearCookie('RefeshToken');
        return res.status(200).json({
            message: "Logged out"
        })
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
}

exports.user_delete_user = (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.user_patch_user = (req, res, next) => {
    const userId = req.userData.userId;
    const updateOps = {};
    for (const ops of req.body) {
        if (ops.propName === 'password') {
            if (ops.value.length < 6) {
                return res.status(400).json({ message: 'Password is least 6 characters long' });
            }
            bcrypt.hash(ops.value, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
                        message: 'Error!'
                    })
                } else {
                    updateOps[ops.propName] = hash
                }
            })
        }
        else {
            if (ops.value.length < 1) {
                return res.status(400).json({ message: 'Name is required!' });
            }
            updateOps[ops.propName] = ops.value;
        }
    }
    User.find({ email: updateOps.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                User.updateOne({ _id: userId }, { $set: updateOps })
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: 'User Updated',
                            request: {
                                type: 'GET',
                                result: result,
                                url: 'http://localhost:2228/user/' + userId
                            }
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err,
                            message: 'Update Fail!'
                        })
                    })
            }
        })
}

exports.user_add_to_cart = async (req, res) => {
    try {
        const user = await User.findById(req.userData.userId);
        if (!user) res.status(400).json({ message: 'User does not exist!' });
        await User.findOneAndUpdate(
            { _id: req.user.id },
            { cart: req.body.cart }
        )
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}