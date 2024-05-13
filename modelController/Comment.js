const mongoose = require('mongoose');
const commentSchema = require('../schemaController/commentSchema');

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;