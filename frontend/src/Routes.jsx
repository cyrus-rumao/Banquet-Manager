import React from 'react';
import {
	BrowserRouter,
	Routes as RouterRoutes,
	Route,
	Navigate,
	useNavigate,
} from 'react-router-dom';

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
const Routes = () => {
	const navigate = useNavigate();
	const user = localStorage.getItem('user')
		? JSON.parse(localStorage.getItem('user'))
		: null;
	console.log(user?.user?.role);
	const role = user?.user?.role || null;

	// useEffect(() => {
	// 	if (user) {
	// 		// If user is logged in, navigate to dashboard
	// 		navigate('/dashboard');
	// 	}
	// }, [user, navigate]);
	return (
		<RouterRoutes>
			<Route
				path="/"
				element={<Home />}
			/>
			<Route
				path="/login"
				element={user ? <Navigate to="/dashboard" /> : <Login />}
			/>
			<Route
				path="/register"
				element={<Register />}
			/>
			<Route
				path="/dashboard"
				element={
					!user ? (
						<Navigate to="/login" />
					) : ['ADMIN', 'SALES', 'FINANCE', 'USER'].includes(role) ? (
						<Dashboard role={user?.user?.role} />
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
		</RouterRoutes>
	);
};

export default Routes;
