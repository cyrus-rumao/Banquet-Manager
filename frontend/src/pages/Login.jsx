import { useState } from 'react';
// import axiosInstance from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useAuthStore';
export default function Login() {
	const { login } = useUserStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

		const handleSubmit = async(e) => {
			e.preventDefault();
			console.log(email, password);
			await login(email, password);
		};

	return (
		<div className="min-h-screen flex">
			{/* LEFT SIDE */}
			<div className="hidden md:flex w-1/2 bg-[#0A1F44] text-white flex-col justify-center items-center p-10">
				<h1 className="text-5xl font-black font-serif mb-4">CraftCater</h1>
				<p className="text-sm tracking-wide text-white/70 text-center max-w-sm">
					Because managing catering without chaos is apparently too much to ask.
				</p>
			</div>

			{/* RIGHT SIDE */}
			<div className="w-full md:w-1/2 flex items-center justify-center bg-[#E8E4DC] px-6">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-md">
					<h2 className="text-3xl font-bold text-[#0A1F44] mb-2">Login</h2>
					<p className="text-sm text-gray-500 mb-6">Welcome back.</p>

					{/* Email */}
					<div className="mb-4">
						<label className="text-xs uppercase tracking-wide text-gray-500">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full mt-1 border-b-1 px-4 py-3 border-gray-300 focus:outline-none focus:border-b-[#C9973A]"
						/>
					</div>

					{/* Password */}
					<div className="mb-4">
						<label className="text-xs uppercase tracking-wide text-gray-500">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className="w-full mt-1 border-b-1 px-4 py-3 border-gray-300 focus:outline-none focus:border-b-[#C9973A]"
						/>
					</div>

					{/* Login Button */}
					<button
						type="submit"
						className="w-full py-3 mt-2 rounded-lg bg-[#0A1F44] text-white font-medium hover:scale-[1.02] transition">
						Login
					</button>

					{/* Register Redirect */}
					<p className="text-sm text-center mt-5 text-gray-600">
						Don’t have an account?{' '}
						<span
							onClick={() => navigate('/register')}
							className="text-[#0A1F44] font-medium cursor-pointer hover:underline">
							Register
						</span>
					</p>
				</form>
			</div>
		</div>
	);
}
