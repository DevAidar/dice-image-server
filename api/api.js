const router = require('express').Router();
const jwt = require('jsonwebtoken');

const middlewares = require('../middlewares/middlewares');
const { create, deleteImageById } = require('./controllers/image-controllers');
const User = require('./models/user.js');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers['access-token'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.status(401).send('Access Denied');

	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		if (err || !User.exists({ '_id': decoded._id })) 
			return res.status(403).send('Invalid Token.');

		req.userId = decoded._id;
    
		next();
	});
};

router.post('/', verifyToken, create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

router.use(middlewares.notFound);
router.use(middlewares.errorHandler);

module.exports = router;