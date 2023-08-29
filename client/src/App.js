import { useEffect, useState, lazy, Suspense } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AppContext } from "./AppContext";
import axios from "axios";
import "./App.css";

const DesktopHomePage = lazy(() =>
	import("./DesktopView/Pages/DesktopHomePage")
);
const MobileHomePage = lazy(() => import("./MobileView/Pages/MobileHomePage"));
const DesktopBookmarks = lazy(() =>
	import("./DesktopView/Pages/DesktopBookmarks")
);
const MobileBookmarks = lazy(() =>
	import("./MobileView/Pages/MobileBookmarks")
);

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [isLoading, setIsLoading] = useState(true);
	const handleResize = () => {
		setWindowWidth(window.innerWidth);
	};
	const [isMobile, setIsMobile] = useState(checkMobile(windowWidth));
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
	useEffect(() => {
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);
	useEffect(() => {
		setIsMobile(checkMobile(windowWidth));
	}, [windowWidth]);
	useEffect(() => {
		(async () => {
			const response = await axios.get("http://localhost:5000/");
			if (response?.data) setIsLoading(false);
			else setIsLoading(true);
		})();
	}, []);
	return (
		<AppContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
			{isLoading && (
				<div className="initial-load">
					<span className="Mloader"></span>
					<span>
						Please sit back and relax while we gather stories from around the
						world !
					</span>
				</div>
			)}
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

function checkMobile(windowWidth) {
	if (windowWidth >= 768) return false;
	else return true;
}

export default App;
