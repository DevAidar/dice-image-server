const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
	// const authHeader = req.query['access-token'];
	const authHeader = req.headers['access-token'];
	console.log('1');
	const token = authHeader && authHeader.split(' ')[1];
	console.log('2');

	console.log(token);
  
	if (!token) return res.status(401).send('Access Denied');
	console.log('3');

	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		console.log('4');
		console.log('err', err ? 'There is an Error' : 'No Errors');
		console.log('decoded', decoded ? decoded : 'Nothing to Decode');

		if (!(decoded && User.exists({ '_id': decoded._id }))) {
			return res.status(403).send('Invalid Token.');
		}

		console.log('5');
		req.userId = decoded._id;
		console.log('6');
    
		// Check if the user exists
		// if (!User.exists({ '_id': decoded._id }))
		// 	throw 'User does not exist';

		console.log('7');
		next();
	});
};

module.exports = { verifyToken };