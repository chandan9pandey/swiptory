import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import ReactModal from "react-modal";
import "./InfinitySlide.css";
import axios from "axios";
import SignUpForm from "./SignUpForm";
import Slider from "./Slider";
import leftSlide from "../Assets/leftSlide.png";
import rightSlide from "../Assets/rightSlide.png";
import saveSlide from "../Assets/saveSlide.png";
import savedSlide from "../Assets/savedSlide.png";
import likeSlide from "../Assets/likeSlide.png";
import likedSlide from "../Assets/likedSlide.png";
import exitSlide from "../Assets/exitSlide.png";
import shareSlide from "../Assets/shareSlide.png";

export default function InfinitySlide(props) {
	const [displayStory, setDisplayStory] = useState([]);
	const [currentSlide, setCurrentSlide] = useState({});
	const [iteration, setIteration] = useState(props.storyID);
	const [lastSlide, setLastSlide] = useState(0);
	const [intervalID, setIntervalID] = useState(-1);
	const [bookmarkChange, setBookmarkChange] = useState("");
	const [likeChange, setLikeChange] = useState(-1);
	const [showSlider, setShowSlider] = useState(0);
	const location = useLocation();
	const notify = (message) =>
		toast(message, {
			duration: 2500,
		});
	useEffect(() => {
		(async () => setDisplayStory(await fetchStoryByID(iteration)))();
		clearInterval(intervalID);
	}, [iteration]);
	useEffect(() => {
		isBookmarked(displayStory[0]?.storyID, setBookmarkChange);
		const interval = [];
		if (displayStory?.length > 1) {
			const timeouts = [];
			const renderItemsWithDelay = () => {
				setCurrentSlide({});
				displayStory.forEach((item, index) => {
					const timeout = setTimeout(() => {
						setCurrentSlide({ ...item });
						if (index + 1 == displayStory.length) setLastSlide(index);
					}, index * 3000);
					timeouts.push(timeout);
				});
			};
			renderItemsWithDelay();
			return () => {
				timeouts.forEach((timeout) => clearTimeout(timeout));
			};
		} else {
			displayStory.map((item, index) => {
				setCurrentSlide(item);
				const intervalID = setInterval(() => {
					setIteration((prev) => prev + 1);
				}, 3000);
				interval.push(intervalID);
				setIntervalID(intervalID);
				return () => clearInterval(interval[0]);
			});
		}
		return () => clearInterval(interval[0]);
	}, [displayStory]);
	useEffect(() => {
		const interval = [];
		if (lastSlide != 0) {
			const intervalID = setInterval(() => {
				setIteration((prev) => prev + 1);
			}, 3000);
			interval.push(intervalID);
			setIntervalID(intervalID);
		}
		return () => clearInterval(interval[0]);
	}, [lastSlide]);
	useEffect(() => {
		isLiked(currentSlide.storyID, currentSlide.iteration, setLikeChange);
		setShowSlider(displayStory.length);
	}, [currentSlide]);
	return (
		<div className="infinitySlides">
			<Slider
				slides={showSlider}
				setSlides={setShowSlider}
				iteration={currentSlide.iteration}
			/>
			{
				<div className="slide">
					<p>
						{currentSlide.heading}
						<br />
						<span>{currentSlide.description}</span>
					</p>
					<img src={currentSlide.imageURL} />
				</div>
			}
			<div className="leftslider">
				<img
					src={leftSlide}
					alt="Left arrow button"
					onClick={() => {
						setIteration((prev) => prev - 1);
					}}
				/>
			</div>
			<div className="rightslider">
				<img
					src={rightSlide}
					alt="Right arrow button"
					onClick={() => {
						setIteration((prev) => prev + 1);
					}}
				/>
			</div>
			{bookmarkChange == "Bookmarked" ? (
				<div className="bookmark">
					<img
						src={savedSlide}
						alt="Saved"
						onClick={() => {
							removeBookmark(currentSlide.storyID, setBookmarkChange);
						}}
					/>
				</div>
			) : (
				<div
					className="bookmark"
					onClick={() => {
						if (bookmarkChange !== "Bookmarked")
							setBookmark(currentSlide.storyID, setBookmarkChange);
					}}
				>
					<img src={saveSlide} alt="Save" />
				</div>
			)}
			{likeChange == -1 || likeChange <= -1 ? (
				<div
					className="likes"
					onClick={() => {
						setLike(
							currentSlide.storyID,
							currentSlide.iteration,
							setLikeChange
						);
					}}
				>
					<img src={likeSlide} alt="unliked slide" />
					<p>
						{(Math.abs(likeChange) != 1 && Math.abs(likeChange)) ||
							currentSlide.likes?.length}
					</p>
				</div>
			) : (
				<div
					className="likes"
					onClick={() => {
						removeLike(
							currentSlide.storyID,
							currentSlide.iteration,
							setLikeChange
						);
					}}
				>
					<img src={likedSlide} alt="liked slide" />
					<p>{likeChange}</p>
				</div>
			)}
			<div
				className="shareSlide"
				onClick={() => {
					const baseURL = window.location.origin;
					(async () => {
						try {
							if (navigator.clipboard) {
								await navigator.clipboard.writeText(
									`${baseURL}/?infinitySlide=true&storyID=${currentSlide.storyID}`
								);
								notify(
									"Story link copied to the clipboard. Share it with your friends !"
								);
							} else {
								notify("Can't access your clipboard.");
								return;
							}
						} catch (e) {
							console.log(e);
						}
					})();
				}}
			>
				<img src={shareSlide} alt="share story" />
			</div>
			<div className="exit" onClick={() => props.setClose(false)}>
				<img src={exitSlide} alt="cross" />
			</div>
			<Toaster />
		</div>
	);
}

async function fetchStoryByID(storyID) {
	try {
		const response = await axios.get(
			`https://swiptoryy.onrender.com/story/${storyID}`
		);
		if (!response.data.Error) return response.data.reverse();
	} catch (e) {
		console.log(e);
	}
}

async function setBookmark(storyID, setBookmarkChange) {
	const notify = (message) =>
		toast(message, {
			duration: 2500,
		});
	try {
		const payload = {
			username: localStorage.getItem("user"),
			storyID: storyID,
		};
		const response = await axios.post(
			"https://swiptoryy.onrender.com/bookmark",
			payload,
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (response.data?.error == "Sign In First")
			notify("Please Login to bookmark stories !");
		else if (response.data?.username == localStorage.getItem("user"))
			setBookmarkChange("Bookmarked");
		else if (
			response.data?.error == "Bookmark already exists. Try delete request."
		)
			setBookmarkChange("Bookmarked");
	} catch (e) {
		console.log(e);
	}
}

async function isBookmarked(storyID, setBookmarkChange) {
	try {
		const username = localStorage.getItem("user");
		const response = await axios.get(
			`https://swiptoryy.onrender.com/bookmark/${username}?storyID=${storyID}`,
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (response.data?.found ?? false) setBookmarkChange("Bookmarked");
		else setBookmarkChange("");
	} catch (e) {
		console.log(e);
	}
}

async function removeBookmark(storyID, setBookmarkChange) {
	try {
		const response = await axios.put(
			"https://swiptoryy.onrender.com/bookmark",
			{
				username: localStorage.getItem("user"),
				storyID: storyID,
			},
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (response.data?.username == localStorage.getItem("user")) {
			setBookmarkChange("");
		} else {
			setBookmarkChange("Bookmarked");
		}
	} catch (e) {
		console.log(e);
	}
}

async function setLike(storyID, iteration, setLikeChange) {
	const notify = (message) =>
		toast(message, {
			duration: 2500,
		});
	try {
		const payload = {
			storyID,
			username: localStorage.getItem("user"),
			iteration,
		};
		const response = await axios.post(
			"https://swiptoryy.onrender.com/like",
			payload,
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (response.data?.includes?.(localStorage.getItem("user")))
			setLikeChange(response.data.length);
		else if (response.data?.error == "Sign In First") {
			notify("Please Login to like stories !");
		} else if (response.data?.error == "User has already liked the story.") {
			setLikeChange("Click me again.");
		}
	} catch (e) {
		console.log(e);
	}
}

async function isLiked(storyID, iteration, setLikeChange) {
	try {
		const user = localStorage.getItem("user");
		const response = await axios.get(
			`https://swiptoryy.onrender.com/like/${storyID}?iteration=${iteration}&username=${user}`,
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (response.data.userLiked) setLikeChange(response.data.likes.length);
		else setLikeChange(-1);
	} catch (e) {
		console.log(e);
	}
}

async function removeLike(storyID, iteration, setLikeChange) {
	try {
		const response = await axios.put(
			"https://swiptoryy.onrender.com/like",
			{
				storyID,
				iteration,
				username: localStorage.getItem("user"),
			},
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (!response.data.likes?.includes(localStorage.getItem("user"))) {
			setLikeChange(-response.data.likes.length);
		}
	} catch (e) {
		console.log(e);
	}
}
