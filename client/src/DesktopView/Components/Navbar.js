import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import Avatar from "../Assets/Avatar.png";
import Hamburger from "../Assets/Hamburger.png";
import "./Navbar.css";

export default function Navbar(props) {
	const { isLoggedIn, setIsLoggedIn } = useContext(AppContext);
	const [showUserControls, setShowUserControls] = useState(false);
	const nav = useNavigate();
	return (
		<>
			<div className="navbar">
				<p>SwipTory</p>
				{!isLoggedIn ? (
					<div className="buttons">
						<button onClick={() => props.setIsSignUp(true)}>
							Register Now
						</button>
						<button onClick={() => props.setIsLogIn(true)}>Sign In</button>
					</div>
				) : (
					<div className="buttons">
						<button onClick={() => nav("/bookmarks")}>Bookmarks</button>
						<button
							className="addStory"
							onClick={() => props.setAddStory(true)}
						>
							Add Story
						</button>
						<img
							src={Avatar}
							alt="AVATAR"
							className="avatar"
							onClick={() =>
								showUserControls
									? setShowUserControls(false)
									: setShowUserControls(true)
							}
						/>
						<img
							src={Hamburger}
							alt="User"
							className="hamburger"
							onClick={() =>
								showUserControls
									? setShowUserControls(false)
									: setShowUserControls(true)
							}
						/>
					</div>
				)}
			</div>
			{showUserControls && (
				<div className="userControls">
					<p>{isLoggedIn}</p>
					<button
						onClick={() => {
							setIsLoggedIn(false);
							setShowUserControls(false);
							localStorage.removeItem("token");
							localStorage.removeItem("user");
						}}
					>
						Log Out
					</button>
				</div>
			)}
		</>
	);
}
