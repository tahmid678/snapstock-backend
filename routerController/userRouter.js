const express = require('express');
const multer = require('multer');
const router = express.Router();
const bcrypt = require('bcrypt');
const process = require('process');
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

router.route('/:userId')
    .get((req, res) => {
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

// route for getting user details based on the user id
// router.get('/get-profile/:userId', (req, res) => {
//     const userId = req.params.userId;
//     User.findOne({ _id: userId })
//         .then(data => res.status(200).send(data))
//         .catch(err => console.log(err));
// })

// route for getting all the liked photos of a specific user
router.get('/get-liked-photos', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId }, { likes: 1, _id: 0 }).populate('likes')
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting all the photos uploded by a user
router.get('/my-photos', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId }, { 'uploads': 1 }).populate('uploads')
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting user details
router.get('/get-user', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId })
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// sign in route, users sign in request comes here 
router.post('/signin', (req, res) => {
    User.find({ email: req.body.email })
        .then(data => {
            if (data.length === 0) {
                res.status(200).send({
                    status: 'Failure',
                    message: 'Invalid credientials. Try again with valid email and password.'
                })
            } else {
                bcrypt.compare(req.body.password, data[0].password)
                    .then(isRegistered => {
                        if (isRegistered) {
                            jwt.sign({
                                firstName: data[0].firstName,
                                lastName: data[0].lastName,
                                email: data[0].email,
                                address: data[0].address,
                                phone: data[0].phone,
                                userId: data[0]._id,
                                likes: data[0].likes,
                                uploads: data[0].uploads
                            }, 'privateKey', { expiresIn: '7d' }, (err, token) => {
                                res.status(201).send({
                                    status: 'Success',
                                    message: 'Login successfull! You will be redirected to profile page.',
                                    token: token
                                });
                            })
                        } else {
                            res.status(200).send({
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
            console.log(req.file);
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
                    const data = fs.readFileSync(path.join(process.cwd() + '/images/' + req.file.originalname));
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email;
                    user.password = hashedPassword;
                    user.address = req.body.address;
                    user.phone = req.body.phone;
                    user.profileImage = {
                        data: data,
                        contentType: "image/jpg"
                    }

                    const newUser = new User(user);
                    newUser.save()
                        .then(data => {
                            fs.unlinkSync(path.join(process.cwd() + '/images/' + req.file.originalname));
                            res.status(201).send({
                                status: 'Success',
                                message: 'User sign up successfull! You will be redirected to login page!'
                            });
                        })
                        .catch(err => res.send(500).send('Internal server error!'));
                })
            })
        }
    } catch (err) {
        res.status(500).send('Internal Server Error!');
    }
})

module.exports = router;