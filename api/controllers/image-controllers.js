const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const detect = require('detect-file-type');
const fs = require('fs');
const path = require('path');

const Image = require('../models/image');
const User = require('../models/user');

const deleteImageById = (req, res, next) => {
	const pictureDirectory = path.join(__dirname, '..', '..', 'uploads', `${req.body['picture-id']}.png`);
  
	fs.unlink(pictureDirectory, (err) => {
		if (err) return res.status(500).send('Unable to delete image.');
    
		User.findById(req.userId, (userError, user) => {
			if (userError) return res.status(500).send('Unable to find user');

			console.log({
				images: user.images.filter((imageId) => !imageId.equals(req.body['picture-id'])),
			});

			User.findByIdAndUpdate(req.userId, 
				{
					images: user.images.filter((imageId) => !imageId.equals(req.body['picture-id'])),
				}, () => {
					Image.findByIdAndDelete(req.body['picture-id'])
						.then(() => next())
						.catch(() => res.status(500).send('1There was an error deleting an image.'));
				});
		});
	});
};

const create = (req, res) => {
	const form = new formidable.IncomingForm();
	const authHeader = req.headers['access-token'];
	const token = authHeader && authHeader.split(' ')[1];

	form.parse(req, (err, _, files) => {
		if (err) return res.status(500).json({ error: err.message });

		if (!files.image) return res.status(401).send('"image" field was not provided');
      
		detect.fromFile(files.image.path, (err, result) => {
			if (err) return res.status(500).json({ error: err.message });
              
			// Allowed ext
			const filetypes = /jpeg|jpg|png/;
          
			// Check ext
			const extname = filetypes.test(result.ext.toLowerCase());
          
			// Check mime
			const mimetype = filetypes.test(result.mime);
          
			if (!mimetype || !extname) {
				return res.status(500).json({ error: 'Incorrect file type' });
			}
          
			// Check File Size
			if (files.image.size > 1048576) {
				return res.status(500).json({ error: 'Image is too large' });
			}

			if (!token) return res.status(401).send('Access Denied');

			jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
				if (!(decoded && User.exists({ '_id': decoded._id }))) {
					return res.status(403).send('Invalid Token.');
				}

				req.userId = decoded._id;
        
				Image.create({
					user: req.userId,
				})
					.then((image) => {
        
						const imageName = `${image._id}.${result.ext.toLowerCase()}`;
              
						// const currentPath = files.image.path;
						const rawData = fs.readFileSync(files.image.path);
						const newPath = path.join(__dirname, '..', '..', 'uploads', imageName);
  
						// Creating image file in uploads folder
						fs.writeFile(newPath, rawData, err => {
							if (err) 
								return Image.findByIdAndDelete(image._id)
									.then(() => res.status(500).json({ error: err.message }))
									.catch(() => res.status(500).json({ error: err.message }));
      
							// Updating corresponding user
							User.findByIdAndUpdate(req.userId, { $push: {
								images: image._id,
							} })
								.then(() => res.status(200).send({ imageId: image._id, userId: req.userId, url: `uploads/${imageName}` }))
								.catch((err) => Image.findByIdAndDelete(image._id)
									.then(() => res.status(500).send({ error: err.message }))
									.catch(() => res.status(500).send({ error: err.message })));
						});
					})
					.catch((err) => res.status(500).json({ error: err.message }));
			});
		});
	});
};



module.exports = { create, deleteImageById };