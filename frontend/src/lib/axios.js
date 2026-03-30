import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
	withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
	const user = JSON.parse(localStorage.getItem('user'));

	if (user?.token) {
		config.headers.Authorization = `Bearer ${user.token}`;
	}

	return config;
});

export default axiosInstance;
