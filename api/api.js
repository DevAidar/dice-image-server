const router = require('express').Router();
const jwt = require('jsonwebtoken');

const middlewares = require('../middlewares/middlewares');
const { create, deleteImageById } = require('./controllers/image-controllers');
const User = require('./models/user.js');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers['access-token'];
	console.log('1');
	const token = authHeader && authHeader.split(' ')[1];
	console.log('2');

	if (!token) return res.status(401).send('Access Denied');
	console.log('3');

	try {
		const verify = jwt.verify(token, process.env.TOKEN_SECRET);
		console.log('4');
		req.userId = verify._id;
		console.log('5');
    
		// Check if the user exists
		if (!User.exists({ '_id': verify._id }))
			throw 'User does not exist';
    
		console.log('6');
		next();
	} catch (err) {
		console.log('7');
		return res.status(403).send({ message: 'Invalid Token.' });
	}
};

router.post('/', verifyToken, create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

router.use(middlewares.notFound);
router.use(middlewares.errorHandler);

module.exports = router;