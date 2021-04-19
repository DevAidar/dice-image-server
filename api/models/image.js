const mongoose = require('mongoose');

const { Schema } = mongoose;

const imageSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	location: {
		type: String,
	},
});

const User = mongoose.model('Images', imageSchema);

module.exports = User;