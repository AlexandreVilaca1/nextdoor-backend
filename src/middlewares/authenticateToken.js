const jwt = require("jsonwebtoken");

function authenticateToken (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ error: "Token not found"});
    }

    jwt.verify(token, process.env.SECRET_KEY, (error, user) => {  
        if (error) {
            return res.status(403).json({ error: "Unauthorized"});
        }
        req.user = user;
        next()
    })
}

module.exports = authenticateToken;