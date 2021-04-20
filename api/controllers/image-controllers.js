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
  
		Image.findByIdAndDelete(req.body['picture-id'])
			.then(() => next())
			.catch(() => res.status(500).send('There was an error deleting an image.'));
	});
};

const create = (req, res, next) => {
	const form = new formidable.IncomingForm();
  
	form.parse(req, (err, _, files) => {
		if (err) return res.status(500).json({ error: err.message });
    
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
      
			Image.create({
				user: req.userId,
			})
				.then((image) => {
      
					const imageName = `${image._id}.${result.ext.toLowerCase()}`;
            
					const currentPath = files.image.path;
					const newPath = path.join(__dirname, '..', '..', 'uploads', imageName);

					console.log('currentPath', currentPath);
					console.log('newPath', newPath);
            
					// Moving the image to the correct directory
					fs.rename(currentPath, newPath, err => {
						if (err) {
							Image.findByIdAndDelete(image._id)
								.then(() => res.status(500).json({ error: err.message }))
								.catch(() => res.status(500).json({ error: err.message }));
						}

						// Updating corresponding user
						User.findByIdAndUpdate(req.userId, { $push: {
							images: image._id,
						} })
							.then(() => next())
							.catch((err) => Image.findByIdAndDelete(image._id)
								.then(() => res.status(500).json({ error: err.message }))
								.catch(() => res.status(500).json({ error: err.message })));
					});
				})
				.catch((err) => res.status(500).json({ error: err.message }));
		});
	});

	return res.status(500).send('There was an error in the database');
};



module.exports = { create, deleteImageById };