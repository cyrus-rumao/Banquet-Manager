import { useState } from 'react';
import axiosInstance from '../lib/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await axiosInstance.post('/auth/login', {
				email,
				password,
			});

			const data = res.data;
			if (res.status === 200) {
				navigate('/');
			}

			localStorage.setItem('user', JSON.stringify(data));

			// alert('Login successful!');
		} catch (err) {
			alert(err.response?.data?.message || 'Login failed');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#E8E4DC] px-4 sm:px-6">
			<form
				onSubmit={handleSubmit}
				className="
          w-full 
          max-w-md 
          sm:max-w-lg 
          p-6 sm:p-8 md:p-10 
          rounded-3xl 
          backdrop-blur-xl 
          border border-[rgba(10,31,68,0.12)] 
          bg-[rgba(245,241,232,0.75)] 
          shadow-[0_20px_60px_rgba(10,31,68,0.12)] 
          transition-all duration-300
        ">
				{/* Title */}
				<div className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#0A1F44] mb-1">
					CraftCater
				</div>

				<div className="font-mono text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] text-[rgba(10,31,68,0.4)] mb-6 sm:mb-7">
					Secure Access Portal
				</div>

				{/* Email */}
				<div className="mb-4 sm:mb-5">
					<div className="text-[10px] sm:text-[11px] tracking-[1.5px] sm:tracking-[2px] uppercase text-[rgba(10,31,68,0.5)] mb-1 font-mono">
						Email
					</div>

					<input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="
              w-full 
              px-3 sm:px-4 
              py-2.5 sm:py-3 
              rounded-xl 
              border border-[rgba(10,31,68,0.12)] 
              focus:border-[#C9973A] 
              focus:ring-2 focus:ring-[#C9973A]/20 
              outline-none 
              transition 
              bg-white 
              text-sm
            "
					/>
				</div>

				{/* Password */}
				<div className="mb-4 sm:mb-5">
					<div className="text-[10px] sm:text-[11px] tracking-[1.5px] sm:tracking-[2px] uppercase text-[rgba(10,31,68,0.5)] mb-1 font-mono">
						Password
					</div>

					<input
						type="password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="
              w-full 
              px-3 sm:px-4 
              py-2.5 sm:py-3 
              rounded-xl 
              border border-[rgba(10,31,68,0.12)] 
              focus:border-[#C9973A] 
              focus:ring-2 focus:ring-[#C9973A]/20 
              outline-none 
              transition 
              bg-white 
              text-sm
            "
					/>
				</div>

				{/* Button */}
				<button
					className="
            w-full 
            mt-2 
            py-2.5 sm:py-3 
            rounded-xl 
            bg-[#0A1F44] 
            text-white 
            text-sm 
            font-medium 
            tracking-wide 
            transition-transform duration-200 
            hover:scale-105
          ">
					Login
				</button>
			</form>
		</div>
	);
}
