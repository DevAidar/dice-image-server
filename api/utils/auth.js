const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers['access-token'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.status(401).send('Access Denied');

	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		if (!(decoded && User.exists({ '_id': decoded._id }))) {
			return res.status(403).send('Invalid Token.');
		}
    
		req.userId = decoded._id;
    
		next();
	});
};

module.exports = { verifyToken };