import React from 'react';
import AdminDashboard from './DashboardPages/AdminDashboard';
import SalesDashboard from './DashboardPages/salesDashboard';
import FinanceDashboard from './DashboardPages/financeDashboard';
import UserDashboard from './DashboardPages/userDashboard';

const Dashboard = ({ role }) => {
	console.log('Dashboard role:', role);

	if (!role) {
		return <div>No role found. Please login.</div>;
	}

	if (role === 'ADMIN') return <AdminDashboard />;
	if (role === 'SALES') return <SalesDashboard />;
	if (role === 'FINANCE') return <FinanceDashboard />;
	if (role === 'USER') return <UserDashboard />;
	if (role === 'GRE') return <div>GRE Dashboard</div>;

	return <div>Invalid role</div>;
};

export default Dashboard;
