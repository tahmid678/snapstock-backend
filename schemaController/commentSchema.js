const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    comment: {
        type: String,
        max: 255,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    photo: {
        type: Schema.Types.ObjectId,
        ref: 'Photo'
    }
});

module.exports = commentSchema;