const { jwtDecode } = require('jwt-decode');

// utility middleware that checks whether a user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const { userId, email } = jwtDecode(token);
        req.userId = userId;
        req.email = email;
        next();
    }
}

module.exports = isAuthenticated;