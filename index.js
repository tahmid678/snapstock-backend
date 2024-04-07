const express = require('express'); // express module to create an express app
const cors = require('cors'); // cors module for cross origin resource sharing
const mongoose = require('mongoose'); // mongoose module for interaction with mongodb database
const userRouter = require('./routerController/userRouter');
const photoRouter = require('./routerController/photoRouter');
const app = express(); // creates an express app

// mongodb connection using this function
mongoose.connect('mongodb://127.0.0.1:27017/snapstock')
    .then(() => console.log('Application is connected to the database.'))
    .catch(err => console.log('Database connection failed!'));

// app using cors module, this will enable resource sharing between different applications
app.use(cors());
// express default middleware for parsing json payload for incoming request
app.use(express.json());
// express default middleware for parsing url encoded payload for incomig request
app.use(express.urlencoded({ extended: true }));

// app will hand over the request to the userRouter 
app.use('/user', userRouter);
// app will hand over the request to the photoRouter
app.use('/photo', photoRouter);

// application starts and wait/listen for the incoming requests
app.listen(3001, () => {
    console.log('Application is running on port 3001');
})