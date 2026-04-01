import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useAuthStore';
const Navbar = () => {
	const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();
	// const location = useLocation();
	const { user, logout } = useUserStore();
	// console.log('User from navbar', user);
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 40);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] flex items-center ${
				scrolled
					? 'bg-[#0A1F44]/95 backdrop-blur-xl shadow-2xl'
					: 'bg-[#0A1F44]'
			}`}>
			<div className="max-w-[1400px] w-full mx-auto px-6 md:px-16 flex items-center justify-between">
				<div
					className="flex items-center gap-3 cursor-pointer group"
					onClick={() => navigate('/')}>
					<div className="w-9 h-9 bg-[#C9973A] flex items-center justify-center font-serif text-lg font-black text-[#0A1F44] tracking-tighter">
						B
					</div>
					<div className="font-serif text-lg font-bold text-white tracking-tight">
						Banquet<span className="text-[#E8B84B]">Pro</span>
					</div>
				</div>

				<div className="hidden md:flex items-center gap-2 ">
					<button
						onClick={() => navigate('/')}
						className="px-5 text-[10px] tracking-[2px] uppercase font-medium text-white/60 hover:text-[#E8B84B] transition-colors">
						Home
					</button>
					

					{!user ? (
						<>
							<button
								onClick={() => navigate('/login')}
								className="px-5 text-[10px] tracking-[2px] uppercase font-medium text-white/60 hover:text-[#E8B84B] transition-colors">
								Login
							</button>
							<button
								onClick={() => navigate('/register')}
								className="h-[38px] px-6 ml-2 bg-[#C9973A] hover:bg-[#E8B84B] text-[#0A1F44] font-mono text-[10px] tracking-[2.5px] uppercase font-medium transition-all hover:-translate-y-0.5 active:scale-95">
								Register →
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => navigate('/dashboard')}
								className="h-[38px] px-6 ml-2 bg-[#C9973A] hover:bg-[#E8B84B] text-[#0A1F44] font-mono text-[10px] tracking-[2.5px] uppercase font-medium transition-all">
								Dashboard
							</button>
							<button
								onClick={logout}
								className="h-[38px] px-6 ml-2 border border-white/20 text-white/60 hover:text-white font-mono text-[10px] tracking-[2.5px] uppercase transition-all">
								Logout
							</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
