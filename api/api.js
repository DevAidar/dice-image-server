const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { create, deleteImageById } = require('./controllers/image-controllers');
const User = require('./models/user.js');

const verifyToken = async (req, res, next) => {
	const authHeader = req.headers['access-token'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.status(500).send({ message: 'Access Denied' });

	try {
		const verify = jwt.verify(token, process.env.TOKEN_SECRET);
		req.userId = verify._id;
    
		// Check if the user exists
		await User.exists({ '_id': verify._id });
    
		next();
	} catch (err) {
		return res.status(500).send({ message: 'Invalid Token.' });
	}
};

router.post('/', verifyToken, create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

module.exports = router;