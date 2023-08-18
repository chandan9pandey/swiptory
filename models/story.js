const { default: mongoose } = require("mongoose");

const storySchema = new mongoose.Schema({
	storyID: {
		type: Number,
		default: 0,
	},
	heading: String,
	description: String,
	imageURL: String,
	category: String,
	likes: {
		type: Array,
		default: [],
	},
	iteration: {
		type: Number,
		default: 0,
		min: [0, "Iteration cannot be less than 0"],
		max: [5, "Iteration cannot be more than 5"],
	},
	createdByUser: String,
});

module.exports = mongoose.model("Story", storySchema);
