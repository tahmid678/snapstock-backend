require('dotenv').config();
const express = require('express');
const multer = require('multer');
const router = express.Router();
const bcrypt = require('bcrypt');
const process = require('process');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('../utils/checkAuthentication');
const User = require('../modelController/User');

// multer storage declaration for files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

// route for getting all the liked photos of a specific user
router.get('/liked-photos', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId }, { likes: 1, _id: 0 }).populate('likes')
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting all the photos uploded by a user
router.get('/my-photos', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId }, { uploads: 1, _id: 0 }).populate('uploads')
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// sign in route, users sign in request comes here 
router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(data => {
            if (!data) {
                res.status(200).send({
                    status: 'Failure',
                    message: 'Invalid credientials. Try again with valid email and password.'
                })
            } else {
                bcrypt.compare(req.body.password, data.password)
                    .then(isRegistered => {
                        if (isRegistered) {
                            jwt.sign({
                                userId: data._id,
                                email: data.email,
                                role: data.role
                            }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' }, (err, token) => {
                                res.status(200).send({
                                    status: 'Success',
                                    message: 'Login successfull! You will be redirected to profile page.',
                                    token: token
                                });
                            })
                        } else {
                            res.status(403).send({
                                status: 'Failure',
                                message: 'Invalid credientials. Try again with valid email and password.'
                            });
                        }
                    })
            }
        })
})

// sign up route, users sign up request comes here 
router.post('/signup', upload.single('profileImage'), async (req, res) => {
    try {
        const isEmailExisted = await User.findOne({ email: req.body.email });
        if (isEmailExisted) {
            fs.unlinkSync(path.join(process.cwd() + '/images/' + req.file.originalname));
            res.status(200).send({
                status: 'Failure',
                message: "Email already in use! Try with different email."
            })
        } else {
            const user = {};
            cloudinary.uploader.upload(path.join(process.cwd() + '/images/' + req.file.originalname), { folder: 'snapstock/user' })
                .then(result => {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
                            user.firstName = req.body.firstName;
                            user.lastName = req.body.lastName;
                            user.email = req.body.email;
                            user.password = hashedPassword;
                            user.address = req.body.address;
                            user.phone = req.body.phone;
                            user.profileImageURL = result.secure_url;

                            const newUser = new User(user);
                            newUser.save()
                                .then(data => {
                                    fs.unlinkSync(path.join(process.cwd() + '/images/' + req.file.originalname));
                                    res.status(201).send({
                                        status: 'Success',
                                        message: 'User sign up successfull! You will be redirected to login page!'
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Internal server error!");
                                });
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Internal server error!");
                })
        }
    } catch (err) {
        res.status(500).send('Internal Server Error!');
    }
})

router.route('/:userId')
    .get(isAuthenticated, (req, res) => {
        const userId = req.params.userId;
        User.findOne({ _id: userId })
            .then(data => res.status(200).send(data))
            .catch(err => console.log(err));
    })
    .put(isAuthenticated, (req, res) => {
        const userId = req.params.userId;
        User.updateOne({ _id: userId }, { $set: { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, address: req.body.address, phone: req.body.phone } })
            .then(data => res.status(201).send(data))
            .catch(err => res.status(500).send(err));
    })
    .delete(isAuthenticated, (req, res) => {
        const userId = req.params.userId;
        User.deleteOne({ _id: userId })
            .then(data => res.status(200).send(data))
            .catch(err => res.status(500).send(err));
    })

module.exports = router;