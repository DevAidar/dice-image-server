const router = require('express').Router();

const { create, deleteImageById } = require('./controllers/image-controllers');
const { verifyToken } = require('./utils/auth');

router.post('/', create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

module.exports = router;