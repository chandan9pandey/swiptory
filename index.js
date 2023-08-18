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

app.listen(process.env.PORT, () => {
	mongoose
		.connect(process.env.DB_URL, {
			useNewURLParser: true,
			useUnifiedTopology: true,
		})
		.then(() => console.log("DB connected"))
		.catch((err) => console.log("connection failed", err));
});
