const express = require('express');
const multer = require('multer');
const router = express.Router();
const bcrypt = require('bcrypt');
const process = require('process');
const fs = require('fs');
const path = require('path');
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

router.post('/signup', upload.single('profileImage'), (req, res) => {
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
})

module.exports = router;