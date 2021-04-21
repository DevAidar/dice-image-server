const router = require('express').Router();

const middlewares = require('../middlewares/middlewares');
const { create, deleteImageById } = require('./controllers/image-controllers');
const { verifyToken } = require('./utils/auth');

// const verifyToken = (req, res, next) => {
// 	const authHeader = req.query['access-token'];
// 	const token = authHeader && authHeader.split(' ')[1];

// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verify = jwt.verify(token, process.env.TOKEN_SECRET);
// 		console.log(verify);
// 		req.userId = verify._id;
// 		next();
// 	} catch (err) {
// 		res.status(403).send('Invalid Token.');
// 	}
  
// 	/*

// 	const authHeader = req.query['access-token'];
// 	// const authHeader = req.headers['access-token'];
// 	console.log('1');
// 	const token = authHeader && authHeader.split(' ')[1];
// 	console.log('2');

// 	console.log(token);
  
// 	if (!token) return res.status(401).send('Access Denied');
// 	console.log('3');

// 	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
// 		console.log('4');
// 		console.log('err', err ? 'There is an Error' : 'No Errors');
// 		console.log('decoded', decoded ? decoded : 'Nothing to Decode');

// 		if (!decoded) {
// 			return res.status(403).send('Invalid Token.');
// 		}

// 		console.log('5');
// 		req.userId = decoded._id;
// 		console.log('6');
    
// 		// Check if the user exists
// 		// if (!User.exists({ '_id': decoded._id }))
// 		// 	throw 'User does not exist';

// 		if (!User.exists({ '_id': decoded._id }))
// 			return res.status(403).send('Invalid Token.');
    
// 		console.log('7');
// 		next();
// 	});

//   /* */
// };

router.post('/', verifyToken, create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

router.use(middlewares.notFound);
router.use(middlewares.errorHandler);

module.exports = router;