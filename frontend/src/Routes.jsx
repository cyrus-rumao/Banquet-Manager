import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/useAuthStore';
// 🔹 Pages (create these files)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EventDetails from './pages/EventPages/EventDetail';
import Menu from './pages/EventPages/Menu';
import AuditLogs from './pages/AuditLogs';
// import { useEffect } from 'react';
import CloudinaryUpload from './pages/CloudinaryUpload';
import PaymentSuccessPage from './pages/PaymentSuccess';
import Navbar from './components/Navbar';
import Loading from './pages/Loading';
const Router = () => {
	// const navigate = useNavigate();
	const { user, checkAuth, checkingAuth, role } = useUserStore();
	// const { getCartItems } = useCartStore();
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);
	// console.log(user);
	// console.log("Role:", role);
	if (checkingAuth) return <Loading />;

	return (
		<>
			<Navbar user={user} role={role} />
			<Routes>
				<Route
					path="/"
					element={<Home user={user} />}
				/>
				<Route
					path="/login"
					element={user ? <Navigate to="/dashboard" /> : <Login />}
				/>
				<Route
					path="/register"
					element={user ? <Navigate to="/dashboard" /> : <Register />}
				/>
				<Route
					path="/dashboard"
					element={
						!user ? (
							<Navigate to="/login" />
						) : ['ADMIN', 'SALES', 'FINANCE', 'USER'].includes(role) ? (
							<Dashboard role={role} />
						) : (
							<Navigate to="/" />
						)
					}
				/>
				<Route
					path="/events/:id"
					element={<EventDetails />}
				/>
				<Route
					path="/events/:id/menu"
					element={
						!user ? (
							<Navigate to="/login" />
						) : ['ADMIN', 'SALES', 'FINANCE', 'USER'].includes(role) ? (
							<Menu />
						) : (
							<Navigate to="/" />
						)
					}
				/>

				<Route
					path="/events/:id/audit-logs"
					element={
						!user ? (
							<Navigate to="/login" />
						) : ['ADMIN', 'SALES', 'FINANCE', 'USER'].includes(role) ? (
							<AuditLogs />
						) : (
							<Navigate to="/" />
						)
					}
				/>

				<Route
					path="/payment-success"
					element={<PaymentSuccessPage />}
				/>
				<Route
					path="/image"
					element={<CloudinaryUpload />}
				/>
				{/* Catch-all route */}
				<Route
					path="*"
					element={<NotFound />}
				/>
			</Routes>
		</>
	);
};

export default Router;
