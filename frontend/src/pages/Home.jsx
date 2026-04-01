import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Navbar from '../components/Navbar';
const FEATURES = [
	{
		icon: '📅',
		title: 'Event Lifecycle Management',
		desc: 'Track every event from initial enquiry through booking, execution, and post-event settlement.',
		tag: 'Sales · Finance · Admin',
	},
	{
		icon: '₹',
		title: 'Payments & Financial Tracking',
		desc: 'Log deposits and final settlements. Auto-calculate balances with full GST support.',
		tag: 'Finance · UPI · NEFT',
	},
	{
		icon: '👥',
		title: 'Guest & Headcount Control',
		desc: 'Manage expected and arrived headcounts with Jain-specific flags and live check-ins.',
		tag: 'Kitchen · Front Desk',
	},
	{
		icon: '🛡️',
		title: 'Audit Trail & Compliance',
		desc: 'Every action is logged—who did it, when, and what changed. Immutable records for accountability.',
		tag: 'Admin · Compliance',
	},
	{
		icon: '🍽️',
		title: 'Menu Intelligence',
		desc: 'Assign tiered menus, optimize costs, and get AI package recommendations.',
		tag: 'Procurement · Kitchen',
	},
	{
		icon: '📈',
		title: 'Post-Event Analytics',
		desc: 'Turn raw data into actionable insights—pipeline health and revenue forecasts.',
		tag: 'Management · Strategy',
	},
];

const STATS = [
	{ n: '500+', l: 'Events Managed' },
	{ n: '2L+', l: 'Guests Served' },
	{ n: '₹18Cr', l: 'Revenue Processed' },
];

const Home = ({ user }) => {
	// const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 40);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollTo = (id) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	};

	const logout = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};

	return (
		<div className="bg-[#E8E4DC] min-h-screen font-medium selection:bg-[#C9973A] selection:text-[#0A1F44]">
			{/* ── NAVBAR ───────────────────────────────────────────── */}
	

			{/* ── HERO ─────────────────────────────────────────────── */}
			<section
				id="hero"
				className="relative min-h-screen bg-[#0A1F44] flex flex-col justify-center overflow-hidden">
				{/* Background Grid */}
				<div
					className="absolute inset-0 pointer-events-none opacity-[0.03]"
					style={{
						backgroundImage:
							'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
						backgroundSize: '72px 72px',
					}}
				/>

				{/* Glowing Orbs */}
				<div className="absolute -top-[350px] -right-[200px] w-[900px] h-[900px] rounded-full bg-radial from-[#C9973A]/20 to-transparent blur-3xl pointer-events-none" />
				<div className="absolute -bottom-[150px] left-[5%] w-[600px] h-[600px] rounded-full bg-radial from-[#2952A3]/30 to-transparent blur-3xl pointer-events-none" />

				<div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-16 pt-20">
					<div className="inline-flex items-center gap-4 font-mono text-[10px] tracking-[4px] text-[#E8B84B] uppercase mb-8 before:content-[''] before:w-10 before:h-[1px] before:bg-[#E8B84B]">
						Hackniche Hospitality · Est. 2024
					</div>

					<h1 className="font-serif text-[clamp(56px,8vw,112px)] font-black text-white leading-[0.88] tracking-[-4px]">
						Banquet
						<span
							className="block pl-8 md:pl-20 mt-2 opacity-30 select-none"
							style={{
								WebkitTextStroke: '1.5px rgba(255,255,255,0.8)',
								color: 'transparent',
							}}>
							Pro
						</span>
						<span className="block pl-16 md:pl-36 mt-4 font-medium font-normal italic text-[clamp(18px,2.5vw,30px)] text-[#C9973A] tracking-normal">
							Event Operations, Reimagined
						</span>
					</h1>

					<p className="mt-10 max-w-[560px] font-medium text-sm md:text-base leading-relaxed text-white/50">
						The complete operational platform for Indian banquet halls and
						hospitality venues. From first enquiry to final settlement — every
						detail, every guest, every rupee.
					</p>

					<div className="mt-10 flex flex-wrap gap-4">
						<button
							onClick={() => navigate('/dashboard')}
							className="h-[52px] px-9 bg-[#C9973A] hover:bg-[#E8B84B] text-[#0A1F44] font-medium text-[10px] tracking-[2px] uppercase transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(201,151,58,0.35)]">
							Go to Dashboard
						</button>
						<button
							onClick={() => scrollTo('features')}
							className="h-[52px] px-9 border-1.5 border-white/20 hover:border-white/50 text-white/70 hover:text-white font-medium text-[10px] tracking-[3px] uppercase transition-all">
							Explore Features
						</button>
					</div>
				</div>

				{/* Stats Grid at Bottom of Hero */}
				<div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-[2px] mt-20 border-t border-white/10">
					{STATS.map((s) => (
						<div
							key={s.l}
							className="bg-white/5 p-8 border-t border-white/5">
							<div className="font-medium text-4xl md:text-5xl font-black text-[#E8B84B]">
								{s.n}
							</div>
							<div className="mt-2 font-mono text-[9px] tracking-[3px] text-white/30 uppercase">
								{s.l}
							</div>
						</div>
					))}
					<div className="bg-[#C9973A]/15 p-8 border-t border-[#C9973A]/30">
						<div className="font-medium text-2xl md:text-3xl font-black text-[#E8B84B] mt-2 leading-none">
							Navy & Ivory
						</div>
						<div className="mt-2 font-mono text-[9px] tracking-[3px] text-white/30 uppercase tracking-widest">
							Refined Platform
						</div>
					</div>
				</div>
			</section>

			{/* ── FEATURES SECTION ───────────────────────────────────── */}
			<section
				id="features"
				className="py-28 px-6 md:px-16 max-w-[1400px] mx-auto">
				<div className="inline-flex items-center gap-3 font-mono text-[9px] tracking-[4px] text-[#C9973A] uppercase mb-4 before:content-[''] before:w-8 before:h-[1px] before:bg-[#C9973A]">
					Platform Capabilities
				</div>
				<h2 className="font-medium text-[clamp(32px,4vw,52px)] font-black text-[#0A1F44] tracking-tighter leading-none mb-4">
					Everything your banquet <br /> operation{' '}
					<em className="italic text-[#C9973A]">needs</em>
				</h2>
				<p className="max-w-[480px] text-sm text-[#5A6A8A] leading-relaxed mb-14">
					Built specifically for Indian hospitality — GST-ready, multi-role, and
					designed for the complexity of large-scale event management.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[#0A1F44]/10 border border-[#0A1F44]/10">
					{FEATURES.map((f, i) => (
						<div
							key={i}
							className="group relative bg-[#F5F1E8] p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#0A1F44]/10 overflow-hidden border border-transparent hover:border-[#0A1F44]/20">
							<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0A1F44] to-[#2952A3] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
							<div className="w-12 h-12 bg-[#0A1F44] flex items-center justify-center text-xl mb-6 text-[#E8B84B] shadow-lg">
								{f.icon}
							</div>
							<h3 className="font-medium text-xl font-bold text-[#0A1F44] mb-3 tracking-tight">
								{f.title}
							</h3>
							<p className="text-[13px] text-[#5A6A8A] leading-relaxed mb-6">
								{f.desc}
							</p>
							<div className="font-mono text-[8px] tracking-[2px] text-[#C9973A] uppercase">
								{f.tag}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── FOOTER ───────────────────────────────────────────── */}
			<footer className="bg-[#05132B] py-20 px-6 md:px-16">
				<div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="flex flex-col items-center md:items-start gap-4">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-white/10 flex items-center justify-center font-medium text-sm font-black text-white/50">
								B
							</div>
							<div className="font-medium text-base font-bold text-white/40 tracking-tight">
								Banquet<span className="text-white/20">Pro</span>
							</div>
						</div>
						<div className="font-mono text-[9px] tracking-[2px] text-white/20 uppercase">
							© 2026 BanquetPro · Hackniche Hospitality
						</div>
					</div>

					<div className="flex gap-4">
						{['𝕏', 'in', 'fb'].map((social) => (
							<button
								key={social}
								className="w-9 h-9 border border-white/10 flex items-center justify-center text-[10px] text-white/30 hover:border-[#C9973A] hover:text-[#E8B84B] transition-all">
								{social}
							</button>
						))}
					</div>
				</div>
				<div className="mt-12 text-center text-[8px] font-mono tracking-[4px] text-white/10 uppercase border-t border-white/5 pt-12">
					Precision Built in Mumbai, Maharashtra
				</div>
			</footer>
		</div>
	);
};
export default Home;
