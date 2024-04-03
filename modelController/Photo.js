const mongoose = require('mongoose');
const photoSchema = require('../schemaController/photoSchema');

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;