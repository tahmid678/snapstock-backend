const express = require('express');
const fs = require('fs');
const process = require('process');
const path = require('path');
const multer = require('multer');
const Photo = require('../modelController/Photo');
const User = require('../modelController/User');
const cloudinary = require('cloudinary').v2;
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

// route for getting all the photos and uploading a single photo
router.route('/')
    .get((req, res) => {
        Photo.find()
            .then(data => res.status(201).send(data))
            .catch(err => console.log(err));
    })
    .post(isAuthenticated, upload.single('photo'), (req, res) => {
        const photo = {};
        cloudinary.uploader.upload(path.join(process.cwd() + '/photos/' + req.file.originalname), { folder: 'snapstock/photos' })
            .then(result => {
                photo.name = req.body.name;
                photo.category = req.body.category;
                photo.description = req.body.description;
                photo.photoURL = result.secure_url;
                photo.author = req.userId;

                const newPhoto = new Photo(photo);
                newPhoto.save()
                    .then(data => {
                        fs.unlinkSync(path.join(process.cwd() + '/photos/' + req.file.originalname));
                        res.status(201).send({
                            status: "Success",
                            message: "Photo has been uploaded successfully"
                        })
                    })
                    .catch(err => {
                        res.status(500).send("Internal server error!");
                    })
            })
            .catch(err => {
                res.status(500).send("Internal server error!");
            })
    })

// route for getting photos based on the specific category
router.get('/photos/:category', (req, res) => {
    const category = req.params.category;
    Photo.find({ category: category })
        .then(data => res.status(200).send(data))
        .catch(err => console.log(err));
})

// route for getting a photo based on the name
router.get('/names/:photoName', (req, res) => {
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


// route for updating a photo like based on the photo id
router.put('/like/:photoId', isAuthenticated, (req, res) => {
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
router.put('/unlike/:photoId', isAuthenticated, (req, res) => {
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