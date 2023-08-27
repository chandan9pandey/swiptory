const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
dotenv.config();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const Story = require("./models/story");
const Image = require("./models/image");
const User = require("./models/user");
const story = require("./models/story");

app.get("/", (req, res) => {
	res.json({
		Message: "Welcome in the SwipTory Server",
	});
});

app.get("/health", (req, res) => {
	res.json({
		Message: "Everything is working fine",
	});
});

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	if (await User.findOne({ username: username })) {
		res.json({ error: "User already exists" });
	} else if (!username || !password) {
		res.json({ error: "Empty body received" });
	} else {
		try {
			const encryptedPassword = await bcrypt.hash(password, 10);
			await User.create({
				username: username,
				password: encryptedPassword,
			});
			res.json({
				Success: "All details successfully received for",
				user: username,
			});
		} catch (e) {
			res.json({ error: e });
		}
	}
});

async function authenticate(username, password) {
	const user = await User.findOne({ username });
	if (!user) {
		return false;
	}
	const fetchedPassword = user.password;
	const auth = await bcrypt.compare(password, fetchedPassword);
	if (auth == true) {
		return user.username;
	} else {
		return false;
	}
}

const isAuthenticated = async (req, res, next) => {
	const token = req.headers.token;
	try {
		const verify = await jwt.verify(token, process.env.JWT_SECRET_KEY);
	} catch (e) {
		res.json({ error: "Sign In First", err: e });
		return;
	}
	next();
};

app.post("/verify-token", isAuthenticated, (req, res) => {
	res.send("Token Valid");
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		res.json({ error: "Empty body received" });
	} else {
		const authentication = await authenticate(username, password);
		if (authentication) {
			try {
				const jwtToken = jwt.sign(
					{ username, password },
					process.env.JWT_SECRET_KEY,
					{ expiresIn: "2h" }
				);
				res.json({
					authentication: true,
					status: "SUCCESS",
					message: "User Logged in Successfully",
					token: jwtToken,
					user: username,
				});
			} catch (error) {
				res.json({
					error: error,
				});
			}
		} else {
			res.json({
				authentication: false,
				status: "FAIL",
				message: "Invalid Credentials",
				error: "Authentication Failed",
			});
		}
	}
});

app.post("/story", isAuthenticated, async (req, res) => {
	const storyID = req.body.storyID;
	const found = await Story.find({ storyID });
	const { heading, description, imageURL, category, createdByUser } = req.body;
	if (!heading || !description || !imageURL || !category || !createdByUser) {
		return res.json({ error: "Please fill in all details!" });
	}
	if (found[0] == undefined) {
		try {
			await Story.create({
				storyID,
				heading,
				description,
				imageURL,
				category,
				createdByUser,
			});
			return res.json({
				status: "SUCCESS",
				message: "Story uploaded successfully",
				iteration: 0,
				storyID: storyID,
			});
		} catch (error) {
			return res.send(error);
		}
	}
	if (found) {
		try {
			const iteration = found[found.length - 1].iteration;
			if (iteration >= 6) {
				return res.json({
					Error: "Maximum 6 slides are allowed in a story.",
				});
			}
			await Story.create({
				storyID,
				heading,
				description,
				imageURL,
				category,
				iteration: iteration + 1,
				createdByUser,
			});
			return res.json({
				storyID: storyID,
				status: "SUCCESS",
				Success: "Story uploaded successfully",
				iteration: iteration + 1,
			});
		} catch (error) {
			return res.send(error);
		}
	}
});

app.delete("/story/:id", isAuthenticated, async (req, res) => {
	try {
		const deletedStory = await Story.findByIdAndDelete(req.params.id);
		res.json({
			status: "SUCCESS",
			message: "Story deleted successfully",
			deletedStory,
		});
	} catch (error) {
		res.json({
			status: "FAIL",
			message: "Story couldn't be deleted",
			error: error,
		});
	}
});

app.put("/story", isAuthenticated, async (req, res) => {
	const storyID = req.body.storyID;
	const found = await Story.find({ storyID });
	if (found.length > 0 && found[found.length - 1].iteration == 5) {
		try {
			const deleted = await Story.deleteMany({ storyID });
		} catch (e) {
			return res.json({ Error: "Internal Error with Patch" });
		}
	}
	const { heading, description, imageURL, category } = req.body;
	if (!heading || !description || !imageURL || !category) {
		return res.json({ error: "Incomplete Story! Please fill in all details." });
	}
	if (found[0] == undefined) {
		try {
			await Story.create({ heading, description, imageURL, category });
			return res.json({ Success: "Story Successfully Uploaded" });
		} catch (e) {
			return res.json({ Error: e });
		}
	}
	if (found) {
		try {
			const iteration = found[found.length - 1].iteration;
			if (iteration >= 6)
				return res.json({
					Error: "Maximum 6 slides are allowed in a story.",
				});
			await Story.create({
				storyID,
				heading,
				description,
				imageURL,
				category,
				iteration: iteration + 1,
			});
			return res.json({ Success: "Story Successfully Uploaded" });
		} catch (e) {
			return res.json({ Error: e });
		}
	}
});

app.get("/story/:storyID", async (req, res) => {
	try {
		const storyID = req.params.storyID;
		const category = req.query.category;
		if (category) {
			const found = await Story.find({ category }).sort({ _id: -1 });
			return res.json(found);
		}
		if (storyID == "all") {
			const found = await Story.find({ storyID }).sort({ _id: -1 });
			return res.json(found);
		}
		const found = await Story.find().sort({ _id: -1 });
		return res.json(found);
	} catch (error) {
		return res.json({
			status: "FAIL",
			error: "Backend Error",
		});
	}
});

app.post("/bookmark", isAuthenticated, async (req, res) => {
	try {
		const user = req.body.username;
		const storyID = req.body.storyID;
		const check = await User.findOne({ username: user });
		if (check.bookmarks.includes(storyID)) {
			return res.json({
				error: "This story is already bookmarked.",
			});
		}
		const found = await User.findOneAndUpdate(
			{ username: user },
			{ $push: { bookmarks: storyID } },
			{ new: true }
		);
		return res.json({
			status: "SUCCESS",
			message: "Bookmark added",
			found: found,
		});
	} catch (error) {
		res.json({ error: "Something went wrong with story.", error: error });
	}
});

app.get("/bookmark/:username", isAuthenticated, async (req, res) => {
	try {
		const user = req.params.username;
		const storyID = req.query.storyID;
		const storyIDArray = [storyID];
		const check = await User.findOne({
			username: user,
			bookmarks: { $in: storyIDArray },
		});
		if (check) {
			return res.json({ status: "SUCCESS", message: "Bookmarks fetched" });
		} else {
			return res.json({ status: "FAIL", message: "Bookmarks not found" });
		}
	} catch (error) {
		res.json({
			error: error,
		});
	}
});

app.put("/bookmark", isAuthenticated, async (req, res) => {
	try {
		const user = req.body.username;
		const storyID = req.body.storyID;
		const check = await User.findOne({
			username: user,
			bookmarks: { $in: storyID },
		});
		if (check) {
			const found = await User.findOneAndUpdate(
				{ username: user },
				{ $pull: { bookmarks: storyID } },
				{ new: true }
			);
		}
		return res.json({
			status: "SUCCESS",
			message: "Bookmark removed",
			found: found,
		});
	} catch (error) {
		res.json({ message: "Check user or storyID once.", error: error });
	}
});

app.get("/user/bookmarks/:username", isAuthenticated, async (req, res) => {
	try {
		const username = req.params.username;
		const response = await User.findOne({ username });
		if (response) {
			let userBookmarks = response.bookmarks;
			userBookmarks = userBookmarks.filter(
				(item, index) => userBookmarks.indexOf(item) === index
			);
			return res.json(userBookmarks);
		} else {
			return res.json({ error: "Check user once. User not found !" });
		}
	} catch (error) {
		res.json({ message: "Check user once.", error: error });
	}
});

app.get("/user/story/:username", async (req, res) => {
	try {
		const username = req.params.username;
		if (!username) {
			return res.json({ error: "Please provide a valid username." });
		}
		const found = await Story.find({ createdByUser: username }).sort({
			_id: -1,
		});
		if (!found[0]) {
			return res.json({ error: "This user hasn't created any stories yet." });
		}
		return res.json(found);
	} catch (e) {
		console.log(e);
	}
});

app.post("/like", isAuthenticated, async (req, res) => {
	try {
		const user = req.body.username;
		const storyID = req.body.storyID;
		const iteration = req.body.iteration;
		const userArray = [user];
		if (!user || !storyID || !iteration) {
			return res.json({
				error: "Please check username or storyID or iteration.",
			});
		}
		const check = await Story.findOne({
			storyID,
			iteration,
			likes: { $in: userArray },
		});
		if (check) {
			return res.json({ error: "This story is already liked" });
		}
		const found = await Story.findOneAndUpdate(
			{ storyID, iteration: iteration },
			{ $push: { likes: user } },
			{ new: true }
		);
		return res.json(found.likes);
	} catch (error) {
		return res.json({ error: error });
	}
});

app.put("/like", isAuthenticated, async (req, res) => {
	try {
		const user = req.body.username;
		const storyID = req.body.storyID;
		const iteration = req.body.iteration;
		const userArray = [user];
		const check = await Story.findOne({
			storyID,
			iteration,
			likes: { $in: userArray },
		});
		if (check) {
			const response = await Story.findOneAndUpdate(
				{ storyID, iteration: iteration },
				{ $pull: { likes: user } },
				{ new: true }
			);
			if (response) {
				return res.json(response);
			}
		}
		return res.send("story not found");
	} catch (error) {
		res.json({ error: error });
	}
});

app.get("/like/:storyID", isAuthenticated, async (req, res) => {
	try {
		const storyID = req.params.storyID;
		const iteration = req.query.iteration;
		const username = req.query.username;
		const user = [username];
		if (!storyID || !iteration || !username) {
			res.json({ error: "Please check storyID or iteration once again" });
		}
		const check = await Story.findOne({
			storyID,
			iteration,
			likes: { $in: user },
		});
		if (check) {
			return res.json({ userLiked: true, likes: check.likes });
		}
		let likes = await Story.findOne({ storyID, iteration });
		if (likes) likes = likes.likes;
		return res.json({ userLiked: false, likes: likes });
	} catch (error) {
		res.json({ error: error });
	}
});

app.post("/image", upload.single("image"), async (req, res) => {
	try {
		const imageData = req.file.buffer;
		const heading = req.body.heading;
		const mimeType = req.file.mimetype;
		if (!heading || !imageData) {
			return res.json({ error: "Image without heading" });
		}
		const image = new Image({
			image: imageData,
			heading: heading,
			mimeType: mimeType,
		});
		await image.save();
		res.status(201).send("Image uploaded successfully!");
	} catch (error) {
		console.error(error);
		res.status(500).send("An error occurred during image upload.");
	}
});

app.get("/image/:heading", async (req, res) => {
	try {
		const heading = req.params.heading;
		const image = await StoryImages.findOne({ heading });
		if (!image) {
			return res.status(404).send("Image not found");
		}
		res.set("Content-Type", image.mimeType);
		res.send(image.image);
	} catch (error) {
		console.error(error);
		res.status(500).send("An error occurred while retrieving the image");
	}
});

app.get(
	"/storyid",
	async (req, res) => {
		try {
			let response = await Story.find().sort({ _id: -1 }).limit(1);
			if (!response[0]) {
				response = {
					storyID: 0,
				};
				return res.json(response);
			}
			response = {
				storyID: response[0].storyID + 1,
			};
			res.send(response);
		} catch (e) {
			console.log(e);
		}
	},
	[]
);

app.listen(process.env.PORT, () => {
	mongoose
		.connect(process.env.DB_URL, {
			useNewURLParser: true,
			useUnifiedTopology: true,
		})
		.then(() => console.log("DB connected"))
		.catch((err) => console.log("connection failed", err));
});
