import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/useAuthStore';

// Components
import Navbar from './components/Navbar';
import Loading from './pages/Loading';
import ProtectedRoute from './ProtectRoute';

// Lazy Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const EventDetails = lazy(() => import('./pages/EventPages/EventDetail'));
const Menu = lazy(() => import('./pages/EventPages/Menu'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const CloudinaryUpload = lazy(() => import('./pages/CloudinaryUpload'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccess'));

const Router = () => {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (checkingAuth) return <Loading />;

	const authorizedRoles = ['ADMIN', 'SALES', 'FINANCE', 'USER'];

	return (
		<>
			<Navbar />

			<Suspense fallback={<Loading />}>
				<Routes>
					{/* Public */}
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
						element={user ? <Navigate to="/dashboard" /> : <Register />}
					/>

					{/* Protected */}
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<Dashboard />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/events/:id"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<EventDetails />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/events/:id/menu"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<Menu />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/events/:id/audit-logs"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<AuditLogs />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/payment-success"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<PaymentSuccessPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/image"
						element={
							<ProtectedRoute allowedRoles={authorizedRoles}>
								<CloudinaryUpload />
							</ProtectedRoute>
						}
					/>

					{/* Fallback */}
					<Route
						path="*"
						element={<NotFound />}
					/>
				</Routes>
			</Suspense>
		</>
	);
};

export default Router;
