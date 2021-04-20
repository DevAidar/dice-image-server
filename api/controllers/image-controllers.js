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

const create = (req, res) => {
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
            
					// const currentPath = files.image.path;
					const rawData = fs.readFileSync(files.image.path);
					const newPath = path.join(__dirname, '..', '..', 'uploads', imageName);

					console.log('currentPath', files.image.path);
					console.log('newPath', newPath);
					// console.log('files', files);
					// console.log('files.image', files.image);
          
					// Moving the image to the correct directory
					fs.writeFile(newPath, rawData, err => {
						if (err) 
							return Image.findByIdAndDelete(image._id)
								.then(() => res.status(500).json({ error: err.message, line: '67' }))
								.catch(() => res.status(500).json({ error: err.message, line: '68' }));

						// Updating corresponding user
						return User.findByIdAndUpdate(req.userId, { $push: {
							images: image._id,
						} })
							.then(() => res.status(200).send({ imageId: image._id, userId: req.userId, url: `uploads/${imageName}` }))
							.catch((err) => Image.findByIdAndDelete(image._id)
								.then(() => res.status(500).send({ error: err.message, line: '76' }))
								.catch(() => res.status(500).send({ error: err.message, line: '77' })));
					});
				})
				.catch((err) => res.status(500).json({ error: err.message, line: '80' }));
		});
	});
};



module.exports = { create, deleteImageById };