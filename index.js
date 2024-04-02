const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/snapstock')
    .then(() => console.log('Application is connected to the database.'))
    .catch(err => console.log('Database connection failed!'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3001, () => {
    console.log('Application is running on port 3001');
})