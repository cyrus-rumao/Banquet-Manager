import { useState } from 'react';
import axiosInstance from '../lib/axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await axiosInstance.post('/auth/register', {
				name,
				email,
				phone,
				password,
			});

			if (res.status === 201) {
				localStorage.setItem('user', JSON.stringify(res.data));
				navigate('/');
			}
		} catch (err) {
			alert(err.response?.data?.message || 'Signup failed');
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* LEFT SIDE */}
			<div className="hidden md:flex w-1/2 bg-[#0A1F44] text-white flex-col justify-center items-center p-10">
				<h1 className="text-5xl font-black font-serif mb-4">CraftCater</h1>
				<p className="text-sm tracking-wide text-white/70 text-center max-w-sm">
					Create your account and try not to break production on day one.
				</p>
			</div>

			{/* RIGHT SIDE */}
			<div className="w-full md:w-1/2 flex items-center justify-center bg-[#E8E4DC] px-6">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-md">
					<h2 className="text-3xl font-bold text-[#0A1F44] mb-2">Sign Up</h2>
					<p className="text-sm text-gray-500 mb-6">
						New here? Let’s fix that.
					</p>

					{/* Name */}
					<div className="mb-4">
						<label className="text-xs uppercase tracking-wide text-gray-500">
							Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="w-full mt-1 border-b-1 px-4 py-3 border-gray-300 focus:outline-none focus:border-b-[#C9973A]"
						/>
					</div>

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

					{/* Phone */}
					<div className="mb-4">
						<label className="text-xs uppercase tracking-wide text-gray-500">
							Phone
						</label>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Enter your phone number"
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
							placeholder="Create a password"
							className="w-full mt-1 border-b-1 px-4 py-3 border-gray-300 focus:outline-none focus:border-b-[#C9973A]"
						/>
					</div>

					{/* Button */}
					<button
						type="submit"
						className="w-full py-3 mt-2 rounded-lg bg-[#0A1F44] text-white font-medium hover:scale-[1.02] transition">
						Create Account
					</button>

					{/* Redirect to Login */}
					<p className="text-sm text-center mt-5 text-gray-600">
						Already have an account?{' '}
						<span
							onClick={() => navigate('/login')}
							className="text-[#0A1F44] font-medium cursor-pointer hover:underline">
							Login
						</span>
					</p>
				</form>
			</div>
		</div>
	);
}
