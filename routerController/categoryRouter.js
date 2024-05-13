const express = require('express');
const router = express.Router();
const Category = require('../modelController/Category');

router.route('/')
    .get((req, res) => {
        Category.find()
            .then(data => res.status(200).send(data))
            .catch(err => console.log(err));
    })
    .post((req, res) => {
        const newCategory = new Category(req.body);
        newCategory.save()
            .then(data => res.status(201).send("Category created successfully!"))
            .catch(err => console.log(err));
    })

module.exports = router;