const express = require('express');
const router = express.Router();
const Comment = require('../modelController/Comment');

router.route('/')
    .get((req, res) => {
        Comment.find()
            .populate('author')
            .then(data => res.status(200).send(data))
            .catch(err => console.log(err));
    })
    .post((req, res) => {
        const newComment = new Comment(req.body);
        newComment.save()
            .then(data => res.status(201).send(data))
            .catch(err => console.log(err));
    })
    .put((req, res) => {

    })

module.exports = router;