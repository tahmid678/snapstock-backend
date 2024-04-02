const mongoose = require('mongoose');
const userSchema = require('../schemaController/userSchema');

const User = mongoose.model('User', userSchema);

module.exports = User;