const router = require('express').Router();

const middlewares = require('../middlewares/middlewares');
const { create, deleteImageById } = require('./controllers/image-controllers');
const { verifyToken } = require('./utils/auth');

router.post('/', create);

router.delete('/', verifyToken, deleteImageById, (_, res) => {
	res.send('Successfully Deleted an Image');
});

router.use(middlewares.notFound);
router.use(middlewares.errorHandler);

module.exports = router;