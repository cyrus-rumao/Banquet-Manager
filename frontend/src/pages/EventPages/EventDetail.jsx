import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from './Menu';
import axiosInstance from '../../lib/axios';
import Loading from '../Loading';
const STATUS_CFG = {
	TEMPORARY_ENQUIRY: {
		label: 'Temporary Enquiry',
		color: 'text-[#A07820]',
		bg: 'bg-[#F5EDD5]',
		border: 'border-[#DFC070]',
		dot: 'bg-[#A07820]',
	},
	ENQUIRY_CONFIRMED: {
		label: 'Enquiry Confirmed',
		color: 'text-[#2E7D32]',
		bg: 'bg-[#E8F5E9]',
		border: 'border-[#81C784]',
		dot: 'bg-[#2E7D32]',
	},
	DEPOSIT_RECEIVED: {
		label: 'Deposit Received',
		color: 'text-[#1565C0]',
		bg: 'bg-[#E3F2FD]',
		border: 'border-[#64B5F6]',
		dot: 'bg-[#1565C0]',
	},
	BOOKED: {
		label: 'Booked',
		color: 'text-[#6A1B9A]',
		bg: 'bg-[#F3E5F5]',
		border: 'border-[#BA68C8]',
		dot: 'bg-[#6A1B9A]',
	},
	CANCELLED: {
		label: 'Cancelled',
		color: 'text-[#C62828]',
		bg: 'bg-[#FFEBEE]',
		border: 'border-[#EF9A9A]',
		dot: 'bg-[#C62828]',
	},
	COMPLETED: {
		label: 'Completed',
		color: 'text-[#2E7D32]',
		bg: 'bg-[#E8F5E9]',
		border: 'border-[#81C784]',
		dot: 'bg-[#2E7D32]',
	},
};

// ── HELPERS ──
const formatDate = (iso) =>
	new Date(iso).toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
const formatTime = (iso) =>
	new Date(iso).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
const getDuration = (start, end) => {
	const diff = new Date(end) - new Date(start);
	return `${Math.floor(diff / 36e5)}h`;
};

const EventDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const inputRef = useRef(null);

	const [eventData, setEventData] = useState(null);
	const [activeView, setActiveView] = useState('detail');
	const [members, setMembers] = useState([]);
	const [showInvite, setShowInvite] = useState(false);
	const [email, setEmail] = useState('');
	const [searching, setSearching] = useState(false);
	const [foundUser, setFoundUser] = useState(null);
	const [msg, setMsg] = useState(null);

	const userSession = JSON.parse(localStorage.getItem('user'));
	const userRole = userSession?.user?.role;

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const res = await axiosInstance.get(`/events/${id}`);
				setEventData(res.data);
				setMembers(res.data.members || []);
			} catch (error) {
				console.error('Error fetching event data:', error);
			}
		};
		if (id) fetchEvent();
	}, [id]);

	useEffect(() => {
		if (showInvite && inputRef.current) inputRef.current.focus();
	}, [showInvite]);

	if (!eventData)
		return (
			<Loading />
		);

	const ev = eventData;
	const statusCfg = STATUS_CFG[ev.status] || STATUS_CFG.TEMPORARY_ENQUIRY;
	const duration = getDuration(
		ev.schedule.startDateTime,
		ev.schedule.endDateTime,
	);

	const handleSearch = () => {
		if (!email.trim()) return;
		setSearching(true);
		setFoundUser(null);
		setMsg(null);

		setTimeout(() => {
			const emailLower = email.trim().toLowerCase();
			const alreadyMember = members.find(
				(m) => m.email?.toLowerCase() === emailLower,
			);
			if (alreadyMember) {
				setMsg({
					type: 'err',
					text: `${alreadyMember.name} is already a member.`,
				});
				setSearching(false);
				return;
			}
			if (userSession) {
				setFoundUser(userSession.user);
			} else {
				setMsg({ type: 'err', text: 'No user found.' });
			}
			setSearching(false);
		}, 700);
	};

	const handleAdd = () => {
		if (!foundUser) return;
		setMembers((prev) => [...prev, foundUser]);
		setMsg({ type: 'ok', text: `${foundUser.name} added.` });
		setFoundUser(null);
		setEmail('');
		setTimeout(() => setMsg(null), 3000);
	};

	if (activeView === 'menu') {
		return (
			<div className="bg-[#E8E4DC] min-height-screen">
				<button
					onClick={() => setActiveView('detail')}
					className="fixed top-4 left-4 z-[300] bg-[#C9973A] text-[#0A1F44] px-5 py-2 text-[9px] tracking-[3px] uppercase font-medium hover:bg-[#E8B84B] transition-colors">
					← Back to Event
				</button>
				<Menu
					eventId={ev._id}
					userId={ev.eventManager}
				/>
			</div>
		);
	}

	return (
		<div className="bg-[#E8E4DC] text-[#0A1F44] min-h-screen font-sans overflow-x-hidden">
			{/* HERO */}
			<section className="bg-[#0A1F44] relative overflow-hidden">
				<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(201,151,58,0.2)_0%,transparent_65%)] -top-[300px] -right-[150px] pointer-events-none" />

				<div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:pt-24 md:pb-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
					<div>
						<div className="flex items-center gap-3 font-mono text-[10px] tracking-[4px] text-[#E8B84B] uppercase mb-5 before:content-[''] before:w-8 before:h-[1px] before:bg-[#E8B84B]">
							CraftCater · {ev.eventCode}
						</div>
						<h1 className="font-serif text-[clamp(42px,6vw,80px)] font-black leading-[0.92] text-white tracking-[-3px]">
							{ev.partyName}
							<span className="block font-serif font-normal italic text-[clamp(16px,2vw,26px)] text-[#C9973A] tracking-normal pl-1 mt-3">
								{ev.eventType}
							</span>
						</h1>

						<div
							className={`inline-flex items-center gap-2 font-mono text-[9px] tracking-[3px] font-medium px-3.5 py-1.5 border uppercase mt-5 ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
							<span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
							{statusCfg.label}
						</div>

						<div className="flex flex-wrap gap-3 mt-7">
							{userRole !== 'SALES' && (
								<button
									onClick={() => setActiveView('menu')}
									className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#C9973A] text-[#0A1F44] font-mono text-[10px] tracking-[3px] uppercase font-medium hover:bg-[#E8B84B] transition-all">
									<span className="text-sm">◈</span> Menu Selection
								</button>
							)}
							<button
								onClick={() => setActiveView('songs')}
								className="inline-flex items-center gap-2.5 px-6 py-3 bg-transparent text-[#E8B84B] border border-[#C9973A]/40 font-mono text-[10px] tracking-[3px] uppercase font-medium hover:bg-white/5 transition-all">
								<span className="text-sm">♪</span> Song List
							</button>
							{(userRole === 'ADMIN' || userRole === 'SALES') && (
								<button
									onClick={() => navigate(`/events/${ev._id}/audit-logs`)}
									className="inline-flex items-center gap-2.5 px-6 py-3 bg-transparent text-white/60 border border-white/20 font-mono text-[10px] tracking-[3px] uppercase font-medium hover:bg-white/5 transition-all">
									<span className="text-sm">✏️</span> Audit Logs
								</button>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-1 pt-4 min-w-[220px]">
						{[
							{ n: ev.headcount.expected, l: 'Expected Guests' },
							{ n: `${ev.billing.gstRate}%`, l: 'GST Rate' },
							{ n: duration, l: 'Duration' },
						].map((s) => (
							<div
								key={s.l}
								className="bg-white/5 border border-white/10 p-4 md:px-6 md:py-4 transition-all hover:bg-white/10 hover:border-[#C9973A]/30">
								<div className="font-serif text-4xl font-black text-[#E8B84B]">
									{s.n}
								</div>
								<div className="font-mono text-[9px] tracking-[3px] text-white/30 uppercase mt-1">
									{s.l}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* MAIN CONTENT */}
			<main className="max-w-[1440px] mx-auto px-6 md:px-16 py-14 pb-24 space-y-4">
				{/* SCHEDULE */}
				<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8">
					<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
						Schedule
					</div>
					<div className="flex flex-col md:flex-row items-stretch">
						<div className="flex-1 p-5 bg-[#0A1F44]/5 border border-[#0A1F44]/10">
							<div className="font-mono text-[10px] tracking-[2px] text-[#5A6A8A] mb-1.5">
								{formatDate(ev.schedule.startDateTime)}
							</div>
							<div className="font-serif text-3xl font-bold leading-none">
								{formatTime(ev.schedule.startDateTime)}
							</div>
							<div className="font-mono text-[9px] tracking-[2px] text-[#C9973A] mt-2 uppercase">
								Start
							</div>
						</div>
						<div className="flex items-center justify-center p-4 text-[#C9973A] font-mono text-lg">
							——→
						</div>
						<div className="flex-1 p-5 bg-[#0A1F44]/5 border border-[#0A1F44]/10">
							<div className="font-mono text-[10px] tracking-[2px] text-[#5A6A8A] mb-1.5">
								{formatDate(ev.schedule.endDateTime)}
							</div>
							<div className="font-serif text-3xl font-bold leading-none">
								{formatTime(ev.schedule.endDateTime)}
							</div>
							<div className="font-mono text-[9px] tracking-[2px] text-[#C9973A] mt-2 uppercase">
								End · {duration}
							</div>
						</div>
					</div>
				</div>

				{/* CLIENT & DETAILS */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8">
						<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
							Client
						</div>
						<div className="space-y-5">
							{[
								{
									k: 'Name',
									v: ev.client.name,
									cls: 'font-serif text-xl font-bold',
								},
								{ k: 'Phone', v: ev.client.phone, cls: 'font-mono text-sm' },
								{ k: 'Email', v: ev.client.email, cls: 'font-mono text-sm' },
								{
									k: 'Address',
									v: ev.client.address,
									cls: 'text-[15px] font-medium',
								},
							].map((row) => (
								<div
									key={row.k}
									className="flex flex-col gap-1">
									<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
										{row.k}
									</div>
									<div className={row.cls}>{row.v}</div>
								</div>
							))}
						</div>
					</div>

					<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8">
						<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
							Headcount & Venue
						</div>
						<div className="space-y-5">
							{[
								{
									k: 'Expected',
									v: ev.headcount.expected,
									cls: 'font-serif text-xl font-bold',
								},
								{
									k: 'Arrived',
									v: ev.headcount.arrived,
									cls: 'font-serif text-xl font-bold',
								},
								{
									k: 'Jain Count',
									v: ev.headcount.isJain,
									cls: 'font-serif text-xl font-bold',
								},
								{
									k: 'Venue',
									v: ev.venue?.hall || 'N/A',
									cls: 'font-mono text-[11px]',
								},
							].map((row) => (
								<div
									key={row.k}
									className="flex flex-col gap-1">
									<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
										{row.k}
									</div>
									<div className={row.cls}>{row.v}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* TEAM MEMBERS */}
				<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8">
					<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
						Team Members
					</div>

					{members.length === 0 ? (
						<div className="py-9 text-center font-serif text-lg italic opacity-20">
							No members added yet.
						</div>
					) : (
						<div className="flex flex-col gap-2.5 mb-5">
							{members.map((m, i) => (
								<div
									key={m._id}
									className="flex items-center gap-3.5 p-3.5 bg-[#0A1F44]/5 border border-[#0A1F44]/10 hover:border-[#0A1F44]/30 hover:bg-[#0A1F44]/10"
									style={{ animationDelay: `${i * 50}ms` }}>
									<div className="w-10 h-10 bg-[#0A1F44] text-[#E8B84B] font-serif text-base font-bold flex items-center justify-center flex-shrink-0">
										{(m.name || 'U')[0].toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium leading-none">
											{m.name}
										</div>
										<div className="font-mono text-[10px] text-[#5A6A8A] mt-1">
											{m.email}
										</div>
									</div>
									<div className="font-mono text-[9px] tracking-[2px] text-[#C9973A] uppercase bg-[#C9973A]/10 border border-[#C9973A]/25 px-2.5 py-1">
										{m.role || 'Member'}
									</div>
									<button
										onClick={() =>
											setMembers((prev) => prev.filter((x) => x._id !== m._id))
										}
										className="text-[#0A1F44]/20 hover:text-red-700 p-2 transition-colors">
										×
									</button>
								</div>
							))}
						</div>
					)}

					{!showInvite ? (
						<button
							onClick={() => setShowInvite(true)}
							className="flex items-center gap-2.5 bg-transparent border border-[#0A1F44]/10 text-[#0A1F44] font-mono text-[9px] tracking-[3px] uppercase py-2.5 px-4 hover:border-[#0A1F44] hover:bg-[#0A1F44]/5 transition-all mt-4">
							<span className="text-[#C9973A] text-lg">+</span> Invite Member
						</button>
					) : (
						<div className="mt-4 border border-[#0A1F44]/10 overflow-hidden">
							<div className="bg-[#0A1F44] p-3 md:px-5 flex items-center justify-between font-mono text-[9px] tracking-[3px] text-[#E8B84B] uppercase">
								Invite by Email
								<button
									onClick={() => setShowInvite(false)}
									className="text-white/30 hover:text-white transition-colors">
									✕
								</button>
							</div>
							<div className="p-5 bg-[#F5F1E8]">
								<div className="flex">
									<input
										ref={inputRef}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="team@craftcater.com"
										className="flex-1 border border-[#0A1F44]/10 bg-[#0A1F44]/5 px-4 py-3 font-mono text-sm outline-none focus:border-[#0A1F44] transition-all"
									/>
									<button
										onClick={handleSearch}
										disabled={searching}
										className="bg-[#0A1F44] text-[#E8B84B] px-5 font-mono text-[9px] tracking-[3px] uppercase hover:bg-[#162d5e] disabled:opacity-50 transition-colors">
										{searching ? '...' : 'Search'}
									</button>
								</div>

								{msg && (
									<div
										className={`mt-3 p-2.5 font-mono text-[10px] tracking-tight ${msg.type === 'err' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
										{msg.text}
									</div>
								)}

								{foundUser && (
									<div className="mt-3.5 border border-[#0A1F44]/10 bg-[#0A1F44]/5 p-4 flex items-center gap-3.5">
										<div className="w-9 h-9 bg-[#0A1F44]/10 text-[#0A1F44] font-serif text-lg font-bold flex items-center justify-center">
											{foundUser.name[0]}
										</div>
										<div className="flex-1">
											<div className="text-sm font-medium">
												{foundUser.name}
											</div>
											<div className="font-mono text-[10px] text-[#5A6A8A]">
												{foundUser.email}
											</div>
										</div>
										<button
											onClick={handleAdd}
											className="bg-[#C9973A] hover:bg-[#E8B84B] text-[#0A1F44] px-4 py-2 font-mono text-[9px] font-bold uppercase transition-all">
											+ Add
										</button>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* METRICS & FINANCIALS */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8 ">
						<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
							Event Meta
						</div>
						<div className="space-y-5">
							<div className="flex flex-col gap-1">
								<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
									Event Code
								</div>
								<div className="font-mono text-xl font-bold tracking-tighter">
									{ev.eventCode}
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
									Created At
								</div>
								<div className="text-sm font-medium">
									{formatDate(ev.createdAt)} · {formatTime(ev.createdAt)}
								</div>
							</div>
						</div>
					</div>

					<div className="bg-[#F5F1E8] border border-[#0A1F44]/10 p-8">
						<div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mb-5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#0A1F44]/10">
							Financials
						</div>
						<div className="space-y-5">
							<div className="flex flex-col gap-1">
								<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
									GST Rate
								</div>
								<div className="font-serif text-xl font-bold">
									{ev.billing.gstRate}%
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="font-mono text-[9px] tracking-[2px] text-[#5A6A8A] uppercase">
									Payments
								</div>
								<div
									className={`text-sm font-medium ${!ev.payment ? 'text-[#5A6A8A]/50' : 'text-inherit'}`}>
									{!ev.payment
										? 'No payment record'
										: `₹${ev.payment.totalPaid} / ₹${ev.payment.totalPayable}`}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default EventDetail;
