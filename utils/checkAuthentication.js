const { jwtDecode } = require('jwt-decode');

// utility middleware that checks whether a user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        console.log(token.split(" ")[1]);
        const { userId, email } = jwtDecode(token.split(" ")[1]);
        req.userId = userId;
        req.email = email;
        next();
    } else {
        res.status(303).send("User is not authorized to do this task!");
    }
}

module.exports = isAuthenticated;