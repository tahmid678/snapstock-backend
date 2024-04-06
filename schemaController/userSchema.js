const mongoose = require('mongoose');
const { Schema } = mongoose;

// schema for user
const userSchema = new Schema({
    firstName: {
        type: String,
        min: 3,
        required: true
    },
    lastName: {
        type: String,
        min: 3,
        required: true
    },
    email: {
        type: String,
        min: 5,
        required: true
    },
    password: {
        type: String,
        max: 70,
        required: true
    },
    address: {
        type: String,
        min: 5,
        required: true
    },
    phone: {
        type: String,
        max: 15,
        required: true
    },
    profileImage: {
        data: Buffer,
        contentType: String,
    },
    uploads: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Photo' }]
})

module.exports = userSchema;