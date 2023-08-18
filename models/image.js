const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
	image: {
		type: Buffer,
		required: true,
	},
	heading: {
		type: String,
		required: true,
	},
	mimeType: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Image", imageSchema);
