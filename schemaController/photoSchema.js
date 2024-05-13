const mongoose = require('mongoose');
const { Schema } = mongoose;

// schema for photo
const photoSchema = new Schema({
    name: {
        type: String,
        max: 20,
        required: true
    },
    category: {
        type: String,
        max: 20,
        required: true
    },
    description: {
        type: String,
        max: 200,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    date: {
        type: Date,
        default: Date.now()
    },
    likes: {
        type: Number,
        default: 0
    },
    // comments: [
    //     {
    //         name: String,
    //         comment: String,
    //         time: Date
    //     }
    // ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = photoSchema;