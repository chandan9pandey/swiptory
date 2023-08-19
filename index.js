const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
dotenv.config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const Story = require("./models/story");
const Image = require("./models/image");
const User = require("./models/user");

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
					User: authentication,
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

app.listen(process.env.PORT, () => {
	mongoose
		.connect(process.env.DB_URL, {
			useNewURLParser: true,
			useUnifiedTopology: true,
		})
		.then(() => console.log("DB connected"))
		.catch((err) => console.log("connection failed", err));
});
