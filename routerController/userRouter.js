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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

router.get('/my-photos', isAuthenticated, (req, res) => {
    User.findOne({ _id: req.userId }, { 'uploads': 1 }).populate('uploads')
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

router.post('/signin', (req, res) => {
    User.find({ email: req.body.email })
        .then(data => {
            bcrypt.compare(req.body.password, data[0].password)
                .then(isRegistered => {
                    if (isRegistered) {
                        jwt.sign({
                            firstName: data[0].firstName,
                            lastName: data[0].lastName,
                            email: data[0].email,
                            address: data[0].address,
                            phone: data[0].phone,
                            userId: data[0]._id
                        }, 'privateKey', { expiresIn: '7d' }, (err, token) => {
                            res.status(201).send(token);
                        })
                    } else {
                        res.status(401).send('User is not registered!');
                    }
                })
        })
})

router.post('/signup', upload.single('profileImage'), async (req, res) => {
    try {
        const isEmailExisted = await User.findOne({ email: req.body.email });
        if (isEmailExisted) {
            fs.unlinkSync(path.join(process.cwd() + '/images/' + req.file.originalname));
            res.status(200).send("Email already in use! Try with different email.")
        } else {
            const user = {};
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
                            res.status(201).send('User sign up successfull!');
                        })
                        .catch(err => res.send(500).send('Internal server error!'));
                })
            })
        }
    } catch (err) {
        res.status(500).send('Internal Server Error!');
    }
})

router.put('/update', (req, res) => {
    User.updateOne({ email: req.body.email }, { $set: { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, address: req.body.address, phone: req.body.phone } })
        .then(data => res.status(201).send(data))
        .catch(err => res.status(500).send(err));
})

module.exports = router;