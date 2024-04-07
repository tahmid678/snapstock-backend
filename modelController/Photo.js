const mongoose = require('mongoose');
const photoSchema = require('../schemaController/photoSchema');

// creating a model for Photo
const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;