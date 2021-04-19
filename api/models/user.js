const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	profileImage: {
		type: Schema.Types.ObjectId,
		ref: 'Images',
	},
	images: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Images',
		},
	],
});

const User = mongoose.model('User', userSchema);

module.exports = User;