import React, { useEffect, useState } from "react";
import "./InfinitySlide.css";
import axios from "axios";

export default function InfinitySlide(props) {
	const [displayStory, setDisplayStory] = useState([]);
	const [currentSlide, setCurrentSlide] = useState({});
	const [iteration, setIteration] = useState(props.storyID);
	const [lastSlide, setLastSlide] = useState(0);
	useEffect(() => {
		(async () => setDisplayStory(await fetchStoryByID(iteration)))();
	}, [iteration]);
	useEffect(() => {
		const interval = [];
		if (displayStory.length > 1) {
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
		}
		return () => clearInterval(interval[0]);
	}, [lastSlide]);
	useEffect(() => {
		console.log(iteration);
	}, [iteration]);
	return (
		<div className="infinitySlides">
			<div className="slider">
				<div className="sliding"></div>
			</div>
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
		</div>
	);
}

async function fetchStoryByID(storyID) {
	try {
		const response = await axios.get(`http://localhost:5000/story/${storyID}`);
		if (!response.data.Error) return response.data.reverse();
	} catch (e) {
		console.log(e);
	}
}
