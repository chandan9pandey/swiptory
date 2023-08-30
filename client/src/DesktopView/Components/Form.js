import React, { useContext, useState } from "react";
import "./Form.css";
import { AppContext } from "../../AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Form(props) {
	const [formData, setFormData] = useState({});
	const [response, setResponse] = useState("");
	const { isLoggedIn, setIsLoggedIn } = useContext(AppContext);
	const nav = useNavigate();
	const handleSubmit = async (e, formData) => {
		e.preventDefault();
		if (props.isSignUp) {
			const response = await axios.post(
				"https://swiptoryy.onrender.com/register",
				formData,
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded",
					},
				}
			);
			if (response.data.error) {
				setResponse(response.data.error);
			} else {
				setResponse(`User Successfully Created.`);
			}
		}
		if (props.isLogIn) {
			const response = await axios.post(
				"https://swiptoryy.onrender.com/login",
				formData,
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded",
					},
				}
			);
			if (response.data.error) {
				setResponse(
					`${response.data.error}. Invalid Credentials! Please try again.`
				);
			} else {
				setResponse(`Logged In successfully !`);
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", response.data.user);
				props.setIsLogIn(false);
				setIsLoggedIn(response.data.user);
			}
		}
	};
	return (
		<div className="form">
			{props.isSignUp && signUp(formData, setFormData, handleSubmit, response)}
			{props.isLogIn && logIn(formData, setFormData, handleSubmit, response)}
		</div>
	);
}

function signUp(formData, setFormData, handleSubmit, response) {
	return (
		<>
			<form
				action="https://swiptoryy.onrender.com/register"
				method="POST"
				onChange={(e) =>
					setFormData({ ...formData, [e.target.name]: e.target.value })
				}
				onSubmit={(e) => handleSubmit(e, formData)}
			>
				<p>Register to SwipTory</p>
				<div>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						name="username"
						id="username"
						required
						placeholder="Enter username"
					/>
				</div>
				<div>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						name="password"
						id="password"
						required
						placeholder="Enter password"
					/>
				</div>
				{response && <p className="response">{response}</p>}
				<button type="submit">Register</button>
			</form>
		</>
	);
}

function logIn(formData, setFormData, handleSubmit, response) {
	return (
		<>
			<form
				action="https://swiptoryy.onrender.com/login"
				method="POST"
				onChange={(e) =>
					setFormData({ ...formData, [e.target.name]: e.target.value })
				}
				onSubmit={(e) => {
					handleSubmit(e, formData);
				}}
			>
				<p>Login to SwipTory</p>
				<div>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						name="username"
						id="username"
						required
						placeholder="Enter username"
					/>
				</div>
				<div>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						name="password"
						id="password"
						required
						placeholder="Enter password"
					/>
				</div>
				{response && <p className="response">{response}</p>}
				<button type="submit">Log In</button>
			</form>
		</>
	);
}
