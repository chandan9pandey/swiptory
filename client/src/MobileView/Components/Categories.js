import React, { useEffect, useState } from "react";
import StoriesSection from "./StoriesSection";
import axios from "axios";
import "./Categories.css";

export default function Categories(props) {
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("all");
	useEffect(() => {
		if (props.showBookmarks == true) setSelectedCategory("bookmarks");
		else setSelectedCategory("all");
	}, [props.showBookmarks]);
	useEffect(() => {
		(async () => setCategories(await getCategories()))();
	}, []);
	return (
		<div className="storypart">
			<div className="categoriescontainer">
				<div className="categories">
					{categories?.map((item, key) => {
						return (
							<div
								className={
									selectedCategory == item[0] ? "category selected" : "category"
								}
								key={key}
								onClick={() => setSelectedCategory(item[0])}
							>
								{<p>{item[0]?.toUpperCase()}</p>}
								{<img src={item[1]} />}
							</div>
						);
					})}
				</div>
			</div>
			<StoriesSection
				selectedCategory={selectedCategory}
				categories={categories}
				showBookmarks={props.showBookmarks}
			/>
		</div>
	);
}

async function getCategories() {
	try {
		const response = await axios.get("http://localhost:5000/story/all");
		let categories = response.data.map((i) => [i.category, i.imageURL]);
		categories = categories.filter(
			(currentArray, index, self) =>
				index ===
				self.findIndex((otherArray) => otherArray[0] === currentArray[0])
		);
		categories.unshift(["all"]);
		return categories;
	} catch (e) {
		console.log(e);
	}
}
