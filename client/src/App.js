import { useEffect, useState, lazy, Suspense } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AppContext } from "./AppContext";
import axios from "axios";
import "./App.css";

const DesktopHomePage = lazy(() =>
	import("./DesktopView/Pages/DesktopHomePage")
);
const MobileHomePage = lazy(() => import("./MobileView/Pages/MobileHomPage"));
const DesktopBookmarks = lazy(() =>
	import("./DesktopView/Pages/DesktopBookmarks")
);
const MobileBookmarks = lazy(() =>
	import("./MobileView/Pages/MobileBookmarks")
);

function App() {
	const isMobile = checkMobile();
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	useEffect(() => {
		if (localStorage.getItem("token") == null) return setIsLoggedIn(false);
		const check = async () => {
			const token = localStorage.getItem("token");
			try {
				const response = await axios.post(
					"http://localhost:5000/verify-token",
					{},
					{
						headers: {
							"content-type": "application/x-www-form-urlencoded",
							token: token,
						},
					}
				);
				if (!response.data.error) setIsLoggedIn(localStorage.getItem("user"));
			} catch (e) {
				console.log(e);
			}
		};
		check();
	}, []);
	return (
		<AppContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
			{isMobile ? (
				<Suspense fallback={<div>Loading...</div>}>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<MobileHomePage />} />
							<Route path="/bookmarks" element={<MobileBookmarks />} />
						</Routes>
					</BrowserRouter>
				</Suspense>
			) : (
				<Suspense fallback={<div>Loading...</div>}>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<DesktopHomePage />} />
							<Route path="/bookmarks" element={<DesktopBookmarks />} />
						</Routes>
					</BrowserRouter>
				</Suspense>
			)}
		</AppContext.Provider>
	);
}

function checkMobile() {
	if (
		window.navigator.userAgent.includes("Windows") ||
		window.navigator.userAgent.includes("Mac")
	)
		return false;
	else return true;
}

export default App;
