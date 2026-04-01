// ProtectedRoute.jsx
import { useUserStore } from './stores/useAuthStore';

const ProtectedRoute = ({ allowedRoles, children }) => {
	const { user, role } = useUserStore();

	if (!user)
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	if (allowedRoles && !allowedRoles.includes(role)) {
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	}

	return children;
};
export default ProtectedRoute;