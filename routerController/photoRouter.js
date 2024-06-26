const express = require('express');
const fs = require('fs');
const process = require('process');
const path = require('path');
const multer = require('multer');
const Photo = require('../modelController/Photo');
const User = require('../modelController/User');
const isAuthenticated = require('../utils/checkAuthentication');
const router = express.Router();

// multer storage declaration for files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'photos');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage })

// route for getting all the photos
router.get('/get-all-photos', (req, res) => {
    Photo.find().populate('author')
        .then(data => res.status(201).send(data))
        .catch(err => console.log(err));
})

// route for getting photos based on the specific category
router.get('/get-photos-by-category/:category', (req, res) => {
    const category = req.params.category;
    Photo.find({ category: category })
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting a photo based on the name
router.get('/searchByName/:photoName', (req, res) => {
    const photoName = req.params.photoName;
    Photo.findOne({ name: photoName })
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting a photo based on the photo id
router.get('/get-photo/:photoId', (req, res) => {
    const photoId = req.params.photoId;
    Photo.findOne({ _id: photoId }).populate('author')
        .then(data => res.status(201).send(data))
        .catch(err => console.log(err));
})

// route for posting a comment for a specific photo
router.post('/create-comment/:photoId', (req, res) => {
    const photoId = req.params.photoId;
    const comment = {
        name: req.body.name,
        comment: req.body.comment,
        time: Date.now()
    }

    Photo.updateOne({ _id: photoId }, { $push: { comments: comment } })
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for uploading a photo
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

// route for updating a photo like based on the photo id
router.put('/like-photo/:photoId', isAuthenticated, (req, res) => {
    const photoId = req.params.photoId;
    Photo.updateOne({ _id: photoId }, { $inc: { likes: 1 } })
        .then(data => {
            User.updateOne({ _id: req.userId }, { $push: { likes: photoId } })
                .then(data => res.status(200).send(data))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
})

// route for updating a photo unlike based on the photo id
router.put('/unlike-photo/:photoId', isAuthenticated, (req, res) => {
    const photoId = req.params.photoId;
    Photo.updateOne({ _id: photoId }, { $inc: { likes: -1 } })
        .then(data => {
            User.updateOne({ _id: req.userId }, { $pull: { likes: photoId } })
                .then(data => res.status(200).send(data))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
})

module.exports = router;