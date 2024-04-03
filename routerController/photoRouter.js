const express = require('express');
const fs = require('fs');
const process = require('process');
const path = require('path');
const multer = require('multer');
const Photo = require('../modelController/Photo');
const User = require('../modelController/User');
const isAuthenticated = require('../utils/checkAuthentication');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'photos');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage })

router.get('/get-all-photos', (req, res) => {
    Photo.find().populate('author')
        .then(data => res.status(201).send(data))
        .catch(err => console.log(err));
})

router.post('/upload', isAuthenticated, upload.single('photo'), (req, res) => {
    const photo = {};
    const data = fs.readFileSync(path.join(process.cwd() + '/photos/' + req.file.originalname));
    photo.name = req.body.name;
    photo.category = req.body.category;
    photo.description = req.body.description;
    photo.photo = {
        data: data,
        contentType: 'image/jpg'
    };
    photo.author = req.userId;

    fs.unlinkSync(path.join(process.cwd() + '/photos/' + req.file.originalname));

    const newPhoto = new Photo(photo);
    newPhoto.save()
        .then(data => {
            console.log(req.userId);
            const photoId = data._id;
            console.log(photoId);
            User.updateOne({ _id: req.userId }, { $push: { uploads: photoId } })
                .then(result => {
                    res.status(201).send(data)
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));

})

router.get('/', (req, res) => {
    Photo.find({ name: "Football" }, { photo: 0 }).populate('author')
        .then(data => res.send(data))
})

module.exports = router;