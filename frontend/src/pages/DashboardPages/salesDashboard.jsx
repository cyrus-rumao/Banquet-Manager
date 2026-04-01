import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios';

// ── THEME CONSTANTS (Mapped for logic, styles handled by Tailwind) ───────────
const STATUS_CONFIG = {
	TEMPORARY_ENQUIRY: {
		label: 'Temporary Enquiry',
		short: 'Enquiry',
		color: 'text-[#7C3AED]',
		bg: 'bg-[#EDE9FE]',
		border: 'border-[#C4B5FD]',
		dot: 'bg-[#7C3AED]',
		icon: '◎',
	},
	ENQUIRY_CONFIRMED: {
		label: 'Enquiry Confirmed',
		short: 'Confirmed',
		color: 'text-[#2563EB]',
		bg: 'bg-[#DBEAFE]',
		border: 'border-[#93C5FD]',
		dot: 'bg-[#2563EB]',
		icon: '◉',
	},
	BOOKED: {
		label: 'Booked',
		short: 'Booked',
		color: 'text-[#059669]',
		bg: 'bg-[#D1FAE5]',
		border: 'border-[#6EE7B7]',
		dot: 'bg-[#059669]',
		icon: '◆',
	},
	IN_PROGRESS: {
		label: 'In Progress',
		short: 'Live',
		color: 'text-[#DC2626]',
		bg: 'bg-[#FEE2E2]',
		border: 'border-[#FCA5A5]',
		dot: 'bg-[#DC2626]',
		icon: '▶',
	},
	COMPLETED: {
		label: 'Completed',
		short: 'Done',
		color: 'text-[#374151]',
		bg: 'bg-[#F3F4F6]',
		border: 'border-[#D1D5DB]',
		dot: 'bg-[#374151]',
		icon: '✓',
	},
	CANCELLED: {
		label: 'Cancelled',
		short: 'Cancelled',
		color: 'text-[#9CA3AF]',
		bg: 'bg-[#F9FAFB]',
		border: 'border-[#E5E7EB]',
		dot: 'bg-[#9CA3AF]',
		icon: '✕',
	},
};

const EVENT_TYPE_ICONS = {
	Wedding: '💍',
	Reception: '🥂',
	Engagement: '💎',
	Birthday: '🎂',
	Corporate: '🏢',
	Anniversary: '🌹',
	Farewell: '✈️',
	Conference: '🎙️',
	Other: '✦',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (date) =>
	new Date(date).toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
const fmtTime = (date) =>
	new Date(date).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});

function fmtRevenue(events) {
	const total = events.reduce(
		(sum, e) =>
			sum + (e.payments || []).reduce((s, p) => s + (p.amount || 0), 0),
		0,
	);
	if (total >= 1e5) return `₹${(total / 1e5).toFixed(1)}L`;
	if (total >= 1e3) return `₹${(total / 1e3).toFixed(0)}K`;
	return `₹${total}`;
}

export default function SalesDashboard() {
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	const [activeStatus, setActiveStatus] = useState('ALL');
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		const getEvents = async () => {
			try {
				const res = await axiosInstance.get('/events/');
				setEvents(res.data);
			} catch (error) {
				console.error('Error fetching events:', error);
			}
		};
		getEvents();
	}, []);

	const todayStr = new Date().toLocaleDateString('en-IN', {
		weekday: 'long',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

	const kpis = [
		{ n: events.length, l: 'Total Events' },
		{
			n: events.filter((e) =>
				['BOOKED', 'ENQUIRY_CONFIRMED', 'TEMPORARY_ENQUIRY'].includes(e.status),
			).length,
			l: 'Pipeline',
		},
		{
			n: fmtRevenue(events.filter((e) => e.status === 'BOOKED')),
			l: 'Booked Revenue',
		},
		{
			n: events.filter((e) => e.status === 'IN_PROGRESS').length,
			l: 'Live Today',
		},
	];

	const statusCounts = useMemo(() => {
		const c = { ALL: events.length };
		Object.keys(STATUS_CONFIG).forEach(
			(s) => (c[s] = events.filter((e) => e.status === s).length),
		);
		return c;
	}, [events]);

	const filtered = useMemo(() => {
		return events.filter((e) => {
			const matchStatus = activeStatus === 'ALL' || e.status === activeStatus;
			const q = searchQuery.toLowerCase();
			const matchSearch =
				!q ||
				e.partyName.toLowerCase().includes(q) ||
				e.eventCode.toLowerCase().includes(q) ||
				e.client.name.toLowerCase().includes(q);
			return matchStatus && matchSearch;
		});
	}, [events, activeStatus, searchQuery]);

	const tickerItems = events.filter(
		(e) => e.status === 'BOOKED' || e.status === 'IN_PROGRESS',
	);

	return (
		<div className="min-h-screen bg-[#E8E4DC] font-sans text-[#0A1F44] antialiased">
			{/* ── HERO SECTION ── */}
			<section className="relative overflow-hidden bg-[#0A1F44] px-6 pt-14 pb-0 md:px-16">
				{/* Background Decorative Elements */}
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
						backgroundSize: '55px 55px',
					}}
				/>
				<div className="absolute -top-64 -right-24 h-[700px] w-[700px] rounded-full bg-radial-gradient from-[#C9973A2E] to-transparent pointer-events-none" />

				<div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
					<div>
						<div className="flex items-center gap-3 font-mono text-[10px] tracking-[4px] text-[#E8B84B] uppercase mb-6">
							<span className="w-7 h-px bg-[#E8B84B]" /> Banquet Pro · Sales
							Command
						</div>
						<h1 className="font-serif text-5xl md:text-8xl font-black leading-[0.9] text-white tracking-tighter">
							Sales{' '}
							<span
								className="block text-transparent stroke-white stroke-1 pl-12 mt-1"
								style={{ WebkitTextStroke: '1px rgba(255,255,255,0.18)' }}>
								Pipeline
							</span>
							<span className="block font-serif font-normal italic text-base md:text-2xl text-[#C9973A] tracking-normal pl-24 mt-3">
								Event Dashboard
							</span>
						</h1>
						<p className="mt-7 font-mono text-[10px] tracking-[3px] text-white/30 uppercase pb-14">
							<span className="text-[#E8B84B] font-medium">{todayStr}</span> ·{' '}
							{events.length} events ·{' '}
							{events.filter((e) => e.status === 'IN_PROGRESS').length} live
						</p>
					</div>

					<div className="flex flex-col md:flex-row gap-[3px] pt-0 md:pt-14">
						{kpis.map((k) => (
							<div
								key={k.l}
								className="bg-white/5 border border-white/10 p-5 min-w-[160px] hover:bg-white/10 hover:border-[#C9973A4D] transition-all">
								<div className="font-serif text-4xl font-black text-[#E8B84B] leading-none">
									{k.n}
								</div>
								<div className="font-mono text-[9px] tracking-[3px] text-white/30 uppercase mt-1">
									{k.l}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Ticker */}
				<div className="relative z-10 border-t border-white/10 flex overflow-hidden">
					<div className="bg-[#C9973A] text-[#0A1F44] font-mono text-[9px] tracking-[4px] font-medium px-5 py-3 whitespace-nowrap uppercase">
						Live Pipeline
					</div>
					<div className="flex-1 flex items-center overflow-hidden">
						<div className="flex animate-[scroll_28s_linear_infinite] whitespace-nowrap">
							{[...tickerItems, ...tickerItems].map((e, i) => (
								<div
									key={i}
									className="font-mono text-[10px] tracking-wider text-white/20 px-7 border-r border-white/5 whitespace-nowrap">
									<b className="text-white/60 font-medium">{e.partyName}</b> ·{' '}
									{fmt(e.schedule.startDateTime)} · {e.headcount.expected}{' '}
									guests
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── FILTERS BAR ── */}
			<nav className="sticky top-0 z-50 bg-[#E8E4DC/95] backdrop-blur-xl border-b border-[#0A1F441F] shadow-sm">
				<div className="mx-auto max-w-7xl px-6 md:px-16 flex items-stretch overflow-x-auto no-scrollbar">
					<button
						onClick={() => setActiveStatus('ALL')}
						className={`flex items-center gap-2 px-5 h-14 transition-all border-b-4 ${activeStatus === 'ALL' ? 'border-[#0A1F44]' : 'border-transparent'}`}>
						<div
							className={`w-2 h-2 rounded-full bg-[#0A1F44] ${activeStatus === 'ALL' ? 'scale-125' : ''}`}
						/>
						<span
							className={`font-medium text-[10px] tracking-widest uppercase ${activeStatus === 'ALL' ? 'text-[#0A1F44]' : 'text-[#5A6A8A59]'}`}>
							All Events
						</span>
						<span
							className={`font-mono text-[9px] px-2 py-0.5 rounded-sm ${activeStatus === 'ALL' ? 'bg-[#0A1F44] text-white' : 'bg-[#0A1F4412] text-[#5A6A8A]'}`}>
							{statusCounts.ALL}
						</span>
					</button>

					{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
						<button
							key={key}
							onClick={() => setActiveStatus(key)}
							className={`flex items-center gap-2 px-5 h-14 transition-all border-b-4 ${activeStatus === key ? `border-[${cfg.dot.split('-')[1]}]` : 'border-transparent'}`}>
							<div
								className={`w-2 h-2 rounded-full ${cfg.dot} ${activeStatus === key ? 'scale-125' : ''}`}
							/>
							<span
								className={`font-medium text-[10px] tracking-widest uppercase ${activeStatus === key ? 'text-[#0A1F44]' : 'text-[#5A6A8A59]'}`}>
								{cfg.short}
							</span>
							<span
								className={`font-mono text-[9px] px-2 py-0.5 rounded-sm transition-colors ${activeStatus === key ? `${cfg.bg} ${cfg.color}` : 'bg-[#0A1F4412] text-[#5A6A8A]'}`}>
								{statusCounts[key]}
							</span>
						</button>
					))}

					<div className="ml-auto flex items-center pl-5 border-l border-[#0A1F441F]">
						<span className="text-[#5A6A8A] text-lg">⌕</span>
						<input
							className="bg-transparent border-none outline-none font-mono text-xs tracking-wider text-[#0A1F44] w-48 px-3 placeholder:text-[#0A1F4447]"
							placeholder="Search events..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</nav>

			{/* ── MAIN CONTENT ── */}
			<main className="mx-auto max-w-7xl px-6 md:px-16 py-10 pb-32">
				<div className="flex justify-between items-center mb-4">
					<div>
						<h2 className="font-serif text-3xl font-bold text-[#0A1F44]">
							{activeStatus === 'ALL'
								? 'All Events'
								: STATUS_CONFIG[activeStatus]?.label}
						</h2>
						<div className="font-mono text-[9px] tracking-[3px] text-[#5A6A8A] uppercase mt-1">
							{filtered.length} event{filtered.length !== 1 ? 's' : ''}{' '}
							{searchQuery && `· matching "${searchQuery}"`}
						</div>
					</div>
					<div className="font-serif text-5xl font-black text-[#0A1F440F] leading-none tracking-tighter">
						{filtered.length}
					</div>
				</div>

				<div className="flex flex-col gap-2.5">
					{filtered.length === 0 ? (
						<div className="text-center py-20 font-serif text-xl italic text-[#0A1F442E]">
							No events match this filter.
						</div>
					) : (
						filtered.map((ev, idx) => {
							const cfg = STATUS_CONFIG[ev.status];
							const start = new Date(ev.schedule.startDateTime);
							const initials = ev.client.name
								.split(' ')
								.map((n) => n[0])
								.join('')
								.toUpperCase();

							return (
								<div
									key={ev._id}
									onClick={() => navigate(`/events/${ev._id}`)}
									className="group relative bg-[#F5F1E8] border-[1.5px] border-[#0A1F441F] grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center cursor-pointer transition-all hover:translate-x-1 hover:shadow-xl hover:border-[#0A1F4447] animate-in fade-in slide-in-from-left-2"
									style={{ animationDelay: `${idx * 40}ms` }}>
									<div className={`absolute inset-y-0 left-0 w-1 ${cfg.dot}`} />

									{/* Code */}
									<div className="px-5 py-5 border-r border-[#0A1F441F] min-w-[130px]">
										<div className="font-mono text-xs tracking-wider text-[#5A6A8A]">
											{ev.eventCode}
										</div>
										<div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] tracking-tighter text-[#0A1F4447] uppercase">
											<span>{EVENT_TYPE_ICONS[ev.eventType]}</span>{' '}
											{ev.eventType}
										</div>
									</div>

									{/* Info */}
									<div className="px-6 py-4">
										<div className="font-serif text-xl font-bold text-[#0A1F44] leading-tight group-hover:text-[#C9973A] transition-colors">
											{ev.partyName}
										</div>
										<div className="text-xs text-[#5A6A8A] mt-1 flex flex-wrap gap-3 items-center">
											<span className="flex items-center gap-1 opacity-80">
												👤 {ev.client.name}
											</span>
											<span className="flex items-center gap-1 opacity-80">
												📞 {ev.client.phone}
											</span>
											{ev.billing.companyName && (
												<span className="text-[#C9973A]">
													🏢 {ev.billing.companyName}
												</span>
											)}
										</div>
									</div>

									{/* Date */}
									<div className="hidden md:block px-5 py-4 border-l border-[#0A1F441F] text-center min-w-[130px]">
										<div className="font-serif text-2xl font-black text-[#0A1F44] leading-none">
											{start.getDate().toString().padStart(2, '0')}
										</div>
										<div className="font-mono text-[9px] tracking-widest text-[#5A6A8A] uppercase mt-0.5">
											{start.toLocaleString('en-IN', { month: 'short' })}{' '}
											{start.getFullYear()}
										</div>
										<div className="font-mono text-[10px] text-[#0A1F4466] mt-1">
											{fmtTime(start)}
										</div>
									</div>

									{/* Headcount */}
									<div className="hidden md:block px-5 py-4 border-l border-[#0A1F441F] text-center min-w-[100px]">
										<div className="font-serif text-2xl font-bold text-[#0A1F44] leading-none">
											{ev.headcount.expected}
										</div>
										<div className="font-mono text-[8px] tracking-widest text-[#5A6A8A] uppercase mt-1">
											Guests
										</div>
										{ev.status === 'IN_PROGRESS' &&
											ev.headcount.arrived > 0 && (
												<div className="font-mono text-[9px] text-red-600 mt-1">
													▶ {ev.headcount.arrived} arrived
												</div>
											)}
									</div>

									{/* Manager */}
									<div className="hidden md:block px-5 py-4 border-l border-[#0A1F441F] min-w-[120px]">
										<div className="w-8 h-8 rounded-full bg-[#0A1F44] text-white flex items-center justify-center font-serif font-bold text-sm mb-1.5">
											{initials}
										</div>
										<div className="font-mono text-[8px] tracking-widest text-[#5A6A8A] uppercase">
											Manager
										</div>
										<div className="text-[11px] font-medium text-[#0A1F44]">
											{typeof ev.eventManager === 'object'
												? ev.eventManager.name.split(' ')[0]
												: 'Unassigned'}
										</div>
									</div>

									{/* Status */}
									<div className="px-5 py-4 border-l border-[#0A1F441F] min-w-[140px]">
										<div
											className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[9px] font-medium tracking-wider uppercase border rounded-sm ${cfg.color} ${cfg.bg} ${cfg.border}`}>
											<span>{cfg.icon}</span> {cfg.short}
										</div>
										{ev.venue?.name && (
											<div className="mt-2 font-mono text-[9px] tracking-tight text-[#0A1F444D] flex items-center gap-1">
												<span>◈</span> {ev.venue.name}
											</div>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</main>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
				}}
			/>
		</div>
	);
}
