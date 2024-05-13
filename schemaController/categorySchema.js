const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        max: 20,
        required: true
    }
});

module.exports = categorySchema;