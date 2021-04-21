const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
	const authHeader = req.query['access-token'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.status(401).send('Access Denied');

	try {
		const verify = jwt.verify(token, process.env.TOKEN_SECRET);
		console.log(verify);
		req.userId = verify._id;
		next();
	} catch (err) {
		res.status(403).send('Invalid Token.');
	}
};

module.exports = { verifyToken };