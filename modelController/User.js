const mongoose = require('mongoose');
const userSchema = require('../schemaController/userSchema');

// creating a model for User
const User = mongoose.model('User', userSchema);

module.exports = User;