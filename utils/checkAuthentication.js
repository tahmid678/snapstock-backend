require('dotenv').config();
const jwt = require('jsonwebtoken');

// utility middleware that checks whether a user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        const jwtToken = token.split(" ")[1];
        try {
            const isVarified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
            const { userId, email } = isVarified;
            req.userId = userId;
            req.email = email;
            next();
        } catch (err) {
            console.log("Invalid token");
            res.status(303).send("User is not authorized to do this task!");
        }
    } else {
        res.status(303).send("User is not authorized to do this task!");
    }
}

module.exports = isAuthenticated;