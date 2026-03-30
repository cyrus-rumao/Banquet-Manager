import { useState, useEffect, useRef } from 'react';
import Menu from './Menu';
import axiosInstance from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
// import SongList from './SongList'; // future

// ── SCHEME: NAVY & IVORY (matching Menu.jsx) ──
const T = {
	pageBg: '#E8E4DC',
	heroBg: '#0A1F44',
	cardBg: '#F5F1E8',
	navBg: 'rgba(232,228,220,0.94)',
	primary: '#0A1F44',
	accent: '#C9973A',
	accent2: '#E8B84B',
	muted: '#5A6A8A',
	mutedLight: 'rgba(10,31,68,0.35)',
	border: 'rgba(10,31,68,0.12)',
	borderStrong: 'rgba(10,31,68,0.28)',
	trayBg: '#0A1F44',
	trayBorder: '#C9973A',
	heroText: '#FFFFFF',
	heroMuted: 'rgba(255,255,255,0.38)',
	kpiBg: 'rgba(255,255,255,0.06)',
	kpiBorder: 'rgba(255,255,255,0.09)',
};

// ── MOCK EVENT DATA ──

// ── MOCK USER DATABASE (for email search) ──

const STATUS_CFG = {
	TEMPORARY_ENQUIRY: {
		label: 'Temporary Enquiry',
		color: '#A07820',
		bg: '#F5EDD5',
		border: '#DFC070',
	},
	ENQUIRY_CONFIRMED: {
		label: 'Enquiry Confirmed',
		color: '#2E7D32',
		bg: '#E8F5E9',
		border: '#81C784',
	},
	DEPOSIT_RECEIVED: {
		label: 'Deposit Received',
		color: '#1565C0',
		bg: '#E3F2FD',
		border: '#64B5F6',
	},
	BOOKED: {
		label: 'Booked',
		color: '#6A1B9A',
		bg: '#F3E5F5',
		border: '#BA68C8',
	},
	CANCELLED: {
		label: 'Cancelled',
		color: '#C62828',
		bg: '#FFEBEE',
		border: '#EF9A9A',
	},
	COMPLETED: {
		label: 'Completed',
		color: '#2E7D32',
		bg: '#E8F5E9',
		border: '#81C784',
	},
};

function formatDate(iso) {
	const d = new Date(iso);
	return d.toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}
function formatTime(iso) {
	const d = new Date(iso);
	return d.toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}
function getDuration(start, end) {
	const diff = new Date(end) - new Date(start);
	const h = Math.floor(diff / 36e5);
	return `${h}h`;
}

const buildCSS = (T) => `
	@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
	*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
	html{scroll-behavior:smooth}
	body,#root{background:${T.pageBg}}
	.app{font-family:'DM Sans',sans-serif;background:${T.pageBg};color:${T.primary};min-height:100vh;overflow-x:hidden}

	/* HERO */
	.hero{background:${T.heroBg};position:relative;overflow:hidden}
	.hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:60px 60px}
	.hero-glow{position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.2) 0%,transparent 65%);top:-300px;right:-150px;pointer-events:none}
	.hero-glow2{position:absolute;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(41,82,163,0.35) 0%,transparent 65%);bottom:-100px;left:15%;pointer-events:none}
	.hero-content{position:relative;z-index:2;max-width:1440px;margin:0 auto;padding:72px 64px 64px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:start}
	.eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:${T.accent2};text-transform:uppercase;margin-bottom:20px}
	.eyebrow::before{content:'';width:32px;height:1px;background:${T.accent2}}
	.h1{font-family:'Playfair Display',serif;font-size:clamp(42px,6vw,80px);font-weight:900;line-height:0.92;color:${T.heroText};letter-spacing:-3px}
	.h1 .sub{display:block;font-family:'Playfair Display',serif;font-weight:400;font-style:italic;font-size:clamp(16px,2vw,26px);color:${T.accent};letter-spacing:0;padding-left:4px;margin-top:12px}
	.status-pill{display:inline-flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;font-weight:500;padding:6px 14px;border:1px solid;text-transform:uppercase;margin-top:20px}
	.kpi-col{display:flex;flex-direction:column;gap:3px;padding-top:16px;min-width:220px}
	.kpi{background:${T.kpiBg};border:1px solid ${T.kpiBorder};padding:18px 24px;transition:all 0.2s}
	.kpi:hover{background:rgba(255,255,255,0.1);border-color:rgba(201,151,58,0.3)}
	.kpi-n{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;color:${T.accent2};line-height:1}
	.kpi-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:4px}

	/* CONTENT */
	.content{max-width:1440px;margin:0 auto;padding:56px 64px 100px}
	.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
	.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
	.grid-full{margin-bottom:16px}

	/* SECTION CARD */
	.sec-card{background:${T.cardBg};border:1.5px solid ${T.border};padding:32px;animation:rise 0.45s ease both}
	@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
	.sec-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.muted};text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:10px}
	.sec-label::after{content:'';flex:1;height:1px;background:${T.border}}

	/* INFO ROWS */
	.info-row{display:flex;flex-direction:column;gap:4px;margin-bottom:20px}
	.info-row:last-child{margin-bottom:0}
	.info-key{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.muted};text-transform:uppercase}
	.info-val{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${T.primary};line-height:1.2}
	.info-val.mono{font-family:'DM Mono',monospace;font-size:14px;font-weight:400;color:${T.primary}}
	.info-val.sm{font-size:15px;font-family:'DM Sans',sans-serif;font-weight:500}

	/* SCHEDULE BLOCK */
	.sched-block{display:flex;gap:0;align-items:stretch}
	.sched-part{flex:1;padding:20px;background:rgba(10,31,68,0.04);border:1px solid ${T.border}}
	.sched-part + .sched-part{border-left:none}
	.sched-arrow{display:flex;align-items:center;justify-content:center;padding:0 16px;color:${T.accent};font-size:18px;font-family:'DM Mono',monospace}
	.sched-date{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;color:${T.muted};margin-bottom:6px}
	.sched-time{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:${T.primary};line-height:1}
	.sched-dur{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.accent};margin-top:8px;text-transform:uppercase}

	/* MEMBERS */
	.member-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
	.member-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:rgba(10,31,68,0.04);border:1px solid ${T.border};transition:all 0.15s;animation:rise 0.4s ease both}
	.member-row:hover{border-color:${T.borderStrong};background:rgba(10,31,68,0.07)}
	.member-avatar{width:38px;height:38px;background:${T.primary};color:${T.accent2};font-family:'Playfair Display',serif;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
	.member-info{flex:1;min-width:0}
	.member-name{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:${T.primary};line-height:1}
	.member-email{font-family:'DM Mono',monospace;font-size:10px;color:${T.muted};margin-top:3px}
	.member-role{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.accent};text-transform:uppercase;background:rgba(201,151,58,0.1);border:1px solid rgba(201,151,58,0.25);padding:3px 10px;white-space:nowrap}
	.member-remove{background:none;border:none;color:rgba(10,31,68,0.2);font-size:18px;cursor:pointer;padding:4px 8px;transition:color 0.15s;line-height:1}
	.member-remove:hover{color:#C62828}

	/* INVITE PANEL */
	.invite-panel{border:1.5px solid ${T.border};overflow:hidden}
	.invite-head{background:${T.primary};padding:12px 20px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.accent2};text-transform:uppercase;display:flex;align-items:center;gap:10px}
	.invite-body{padding:20px;background:${T.cardBg}}
	.search-row{display:flex;gap:0}
	.search-input{flex:1;border:1.5px solid ${T.border};background:rgba(10,31,68,0.04);padding:12px 16px;font-family:'DM Mono',monospace;font-size:12px;color:${T.primary};outline:none;transition:border-color 0.15s}
	.search-input::placeholder{color:rgba(10,31,68,0.28)}
	.search-input:focus{border-color:${T.primary}}
	.search-btn{background:${T.primary};border:none;color:${T.accent2};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:0 20px;cursor:pointer;transition:background 0.15s;white-space:nowrap}
	.search-btn:hover{background:#162d5e}
	.search-btn:disabled{background:rgba(10,31,68,0.25);cursor:not-allowed}
	.search-result{margin-top:14px;border:1.5px solid ${T.border};background:rgba(10,31,68,0.03);padding:14px 16px;display:flex;align-items:center;gap:14px;animation:rise 0.3s ease both}
	.result-avatar{width:36px;height:36px;background:rgba(10,31,68,0.08);color:${T.primary};font-family:'Playfair Display',serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
	.result-info{flex:1}
	.result-name{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:${T.primary}}
	.result-email{font-family:'DM Mono',monospace;font-size:10px;color:${T.muted};margin-top:2px}
	.add-btn{background:${T.accent};border:none;color:${T.primary};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:9px 16px;cursor:pointer;font-weight:500;transition:all 0.15s}
	.add-btn:hover{background:${T.accent2}}
	.search-msg{margin-top:12px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;padding:10px 12px}
	.msg-err{color:#C62828;background:#FFEBEE;border:1px solid #EF9A9A}
	.msg-ok{color:#2E7D32;background:#E8F5E9;border:1px solid #81C784}
	.msg-info{color:${T.muted};background:rgba(10,31,68,0.04);border:1px solid ${T.border}}

	/* EMPTY STATE */
	.empty-members{text-align:center;padding:36px 0;font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:rgba(10,31,68,0.2)}

	/* DIVIDER */
	.divider{height:1px;background:${T.border};margin:0}

	/* INVITE TOGGLE BTN */
	.invite-toggle{display:flex;align-items:center;gap:10px;background:none;border:1.5px solid ${T.border};color:${T.primary};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:10px 18px;cursor:pointer;transition:all 0.15s;margin-top:16px}
	.invite-toggle:hover{border-color:${T.primary};background:rgba(10,31,68,0.04)}
	.invite-toggle .plus{font-size:18px;font-family:'DM Sans',sans-serif;color:${T.accent};line-height:1}

	/* ACTION BUTTONS */
	.action-bar{display:flex;gap:12px;flex-wrap:wrap}
	.action-btn{display:inline-flex;align-items:center;gap:10px;padding:13px 24px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:500;cursor:pointer;border:none;transition:all 0.2s}
	.action-btn-primary{background:${T.accent};color:${T.primary}}
	.action-btn-primary:hover{background:${T.accent2}}
	.action-btn-secondary{background:transparent;color:rgba(255,255,255,0.6);border:1.5px solid rgba(255,255,255,0.18)}
	.action-btn-secondary:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.35)}
	.action-btn-icon{font-size:14px;line-height:1}

	@media(max-width:900px){.hero-content,.grid2,.grid3{grid-template-columns:1fr}.content{padding:32px 24px 80px}.hero-content{padding:48px 24px 48px}}
	`;

export default function EventDetail() {
	const { id } = useParams();
	console.log(id);

	const [eventData, setEventData] = useState(null);
	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const res = await axiosInstance.get(`/events/${id}`);
				setEventData(res.data);
				console.log('Fetched Event', res.data);
			} catch (error) {
				console.error('Error fetching event data:', error);
			}
		};
		fetchEvent();
	}, []);
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));
	console.log('User', user?.user?.role);
	const [activeView, setActiveView] = useState('detail'); // 'detail' | 'menu' | 'songs'
	const [members, setMembers] = useState(eventData ? eventData.members : []);
	const [showInvite, setShowInvite] = useState(false);
	const [email, setEmail] = useState('');
	const [searching, setSearching] = useState(false);
	const [foundUser, setFoundUser] = useState(null);
	const [msg, setMsg] = useState(null); // {type: 'err'|'ok'|'info', text}
	const inputRef = useRef(null);
	useEffect(() => {
		if (showInvite && inputRef.current) inputRef.current.focus();
	}, [showInvite]);
	if (!eventData) {
		return <div>Loading...</div>;
	}
	const ev = eventData;
	const statusCfg = STATUS_CFG[ev.status] || STATUS_CFG.TEMPORARY_ENQUIRY;
	const status = ev.status;
	console.log(ev.status);
	const handleSearch = () => {
		if (!email.trim()) return;
		setSearching(true);
		setFoundUser(null);
		setMsg(null);

		// Simulate API call
		setTimeout(() => {
			const emailLower = email.trim().toLowerCase();
			// Check if already a member
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
			if (user) {
				setFoundUser(user);
				setMsg(null);
			} else {
				setMsg({ type: 'err', text: 'No user found with this email address.' });
			}
			setSearching(false);
		}, 700);
	};

	const handleAdd = () => {
		if (!foundUser) return;
		setMembers((prev) => [...prev, foundUser]);
		setMsg({ type: 'ok', text: `${foundUser.name} added as a member.` });
		setFoundUser(null);
		setEmail('');
		setTimeout(() => setMsg(null), 3000);
	};

	const handleRemove = (id) => {
		setMembers((prev) => prev.filter((m) => m._id !== id));
	};

	const duration = getDuration(
		ev.schedule.startDateTime,
		ev.schedule.endDateTime,
	);

	// If viewing Menu, render it with props
	if (activeView === 'menu') {
		return (
			<>
				<style>{buildCSS(T)}</style>
				<div style={{ position: 'fixed', top: 16, left: 16, zIndex: 300 }}>
					<button
						className="action-btn action-btn-primary"
						onClick={navigate(-1)}
						style={{ padding: '10px 20px', fontSize: 9 }}>
						← Back to Event
					</button>
				</div>
				<Menu
					eventId={ev._id}
					userId={ev.eventManager}
				/>
			</>
		);
	}

	// If viewing Song List (placeholder)
	if (activeView === 'songs') {
		return (
			<>
				<style>{buildCSS(T)}</style>
				<div className="app">
					<div
						className="hero"
						style={{ minHeight: 200 }}>
						<div className="hero-grid" />
						<div className="hero-glow" />
						<div
							className="hero-content"
							style={{ gridTemplateColumns: '1fr' }}>
							<div>
								<div className="eyebrow">CraftCater · {ev.eventCode}</div>
								<h1
									className="h1"
									style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
									{ev.partyName}
									<span className="sub">Song List</span>
								</h1>
							</div>
						</div>
					</div>
					<div
						style={{
							maxWidth: 1440,
							margin: '0 auto',
							padding: '64px',
							textAlign: 'center',
						}}>
						<p
							style={{
								fontFamily: "'Playfair Display',serif",
								fontSize: 28,
								fontStyle: 'italic',
								color: 'rgba(10,31,68,0.2)',
								marginBottom: 32,
							}}>
							Song list coming soon…
						</p>
						<button
							className="action-btn action-btn-secondary"
							onClick={() => setActiveView('detail')}>
							← Back to Event
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<style>{buildCSS(T)}</style>
			<div className="app">
				{/* HERO */}
				<div className="hero">
					<div className="hero-grid" />
					<div className="hero-glow" />
					<div className="hero-glow2" />
					<div className="hero-content">
						<div>
							<div className="eyebrow">CraftCater · {ev.eventCode}</div>
							<h1 className="h1">
								{ev.partyName}
								<span className="sub">{ev.eventType}</span>
							</h1>
							<div
								className="status-pill"
								style={{
									color: statusCfg.color,
									background: statusCfg.bg,
									borderColor: statusCfg.border,
								}}>
								<span
									style={{
										width: 6,
										height: 6,
										borderRadius: '50%',
										background: statusCfg.color,
										display: 'inline-block',
									}}
								/>
								{statusCfg.label}
							</div>
							<div
								className="action-bar"
								style={{ marginTop: 28 }}>
								{user?.user?.role !== 'SALES' && (
									<button
										className="action-btn action-btn-primary"
										onClick={() => navigate(`/events/${ev._id}/menu`)}>
										<span className="action-btn-icon">◈</span>
										Menu Selection
									</button>
								)}
								<button
									className="action-btn action-btn-secondary"
									style={{
										color: T.accent2,
										borderColor: 'rgba(201,151,58,0.4)',
									}}
									onClick={() => setActiveView('songs')}>
									<span className="action-btn-icon">♪</span>
									Song List
								</button>
								{user?.user?.role === 'ADMIN' || user?.user?.role === 'SALES' && (
									<button
										className="action-btn action-btn-secondary"
										onClick={() => navigate(`/events/${ev._id}/audit-logs`)}>
										<span className="action-btn-icon">✏️</span>
										View Audit Logs
									</button>
								)}
								{ev.status === 'ENQUIRY_CONFIRMED' && (
									<button
										className="action-btn action-btn-primary"
										style={{ background: '#2E7D32', color: '#fff' }}
										onClick={async () => {
											try {
												// 1. get tier
												const tier = localStorage.getItem('selectedTier');

												if (!tier) {
													alert('Select menu tier first');
													return;
												}

												// 2. create payment record (calculates price)
												await axiosInstance.post('/payments/init', {
													eventId: ev._id,
													tier,
												});

												// 3. create stripe session (deposit)
												const res = await axiosInstance.post(
													'/payments/create-installment-session',
													{
														eventId: ev._id,
														installmentIndex: 0,
													},
												);

												// 4. redirect to stripe
												window.location.href = res.data.url;
											} catch (err) {
												console.error(err);
											}
										}}>
										<span className="action-btn-icon">💳</span>
										Pay Booking Deposit
									</button>
								)}
							</div>
						</div>
						<div className="kpi-col">
							{[
								{ n: ev.headcount.expected, l: 'Expected Guests' },
								{ n: `${ev.billing.gstRate}%`, l: 'GST Rate' },
								{ n: duration, l: 'Duration' },
							].map((s) => (
								<div
									className="kpi"
									key={s.l}>
									<div className="kpi-n">{s.n}</div>
									<div className="kpi-l">{s.l}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* CONTENT */}
				<div className="content">
					{/* Row 1: Schedule (full width) */}
					<div
						className="grid-full"
						style={{ animationDelay: '0ms' }}>
						<div className="sec-card">
							<div className="sec-label">Schedule</div>
							<div className="sched-block">
								<div className="sched-part">
									<div className="sched-date">
										{formatDate(ev.schedule.startDateTime)}
									</div>
									<div className="sched-time">
										{formatTime(ev.schedule.startDateTime)}
									</div>
									<div className="sched-dur">Start</div>
								</div>
								<div className="sched-arrow">——→</div>
								<div className="sched-part">
									<div className="sched-date">
										{formatDate(ev.schedule.endDateTime)}
									</div>
									<div className="sched-time">
										{formatTime(ev.schedule.endDateTime)}
									</div>
									<div className="sched-dur">End · {duration} total</div>
								</div>
							</div>
						</div>
					</div>

					{/* Row 2: Client + Headcount */}
					<div className="grid2">
						<div
							className="sec-card"
							style={{ animationDelay: '60ms' }}>
							<div className="sec-label">Client</div>
							<div className="info-row">
								<div className="info-key">Name</div>
								<div className="info-val">{ev.client.name}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Phone</div>
								<div className="info-val mono">{ev.client.phone}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Email</div>
								<div className="info-val mono">{ev.client.email}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Address</div>
								<div className="info-val sm">{ev.client.address}</div>
							</div>
						</div>

						<div
							className="sec-card"
							style={{ animationDelay: '90ms' }}>
							<div className="sec-label">Headcount & Details</div>
							<div className="info-row">
								<div className="info-key">Expected</div>
								<div className="info-val">{ev.headcount.expected}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Arrived</div>
								<div className="info-val">{ev.headcount.arrived}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Jain Count</div>
								<div className="info-val">{ev.headcount.isJain}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Venue ID</div>
								<div
									className="info-val mono"
									style={{ fontSize: 11 }}>
									{ev.venue}
								</div>
							</div>
						</div>
					</div>

					{/* Row 3: Members (full width) */}
					<div
						className="grid-full"
						style={{ animationDelay: '120ms' }}>
						<div className="sec-card">
							<div className="sec-label">Team Members</div>

							{members.length === 0 ? (
								<div className="empty-members">No members added yet.</div>
							) : (
								<div className="member-list">
									{members.map((m, i) => (
										<div
											className="member-row"
											key={m._id}
											style={{ animationDelay: `${i * 50}ms` }}>
											<div className="member-avatar">
												{(m.name || 'U')[0].toUpperCase()}
											</div>
											<div className="member-info">
												<div className="member-name">{m.name}</div>
												<div className="member-email">{m.email || '—'}</div>
											</div>
											<div className="member-role">{m.role || 'Member'}</div>
											<button
												className="member-remove"
												onClick={() => handleRemove(m._id)}
												title="Remove">
												×
											</button>
										</div>
									))}
								</div>
							)}

							{/* Invite Toggle */}
							{!showInvite && (
								<button
									className="invite-toggle"
									onClick={() => {
										setShowInvite(true);
										setMsg(null);
										setFoundUser(null);
										setEmail('');
									}}>
									<span className="plus">+</span>
									Invite Member
								</button>
							)}

							{/* Invite Panel */}
							{showInvite && (
								<div
									className="invite-panel"
									style={{ marginTop: 16, animation: 'rise 0.3s ease both' }}>
									<div className="invite-head">
										<span>Invite by Email</span>
										<button
											onClick={() => {
												setShowInvite(false);
												setFoundUser(null);
												setMsg(null);
												setEmail('');
											}}
											style={{
												marginLeft: 'auto',
												background: 'none',
												border: 'none',
												color: 'rgba(255,255,255,0.35)',
												cursor: 'pointer',
												fontSize: 16,
												lineHeight: 1,
											}}>
											✕
										</button>
									</div>
									<div className="invite-body">
										<div className="search-row">
											<input
												ref={inputRef}
												className="search-input"
												type="email"
												placeholder="team@craftcater.com"
												value={email}
												onChange={(e) => {
													setEmail(e.target.value);
													setFoundUser(null);
													setMsg(null);
												}}
												onKeyDown={(e) =>
													e.key === 'Enter' && !searching && handleSearch()
												}
											/>
											<button
												className="search-btn"
												onClick={handleSearch}
												disabled={searching || !email.trim()}>
												{searching ? 'Searching…' : 'Search'}
											</button>
										</div>

										{msg && (
											<div className={`search-msg msg-${msg.type}`}>
												{msg.text}
											</div>
										)}

										{foundUser && (
											<div className="search-result">
												<div className="result-avatar">{foundUser.name[0]}</div>
												<div className="result-info">
													<div className="result-name">{foundUser.name}</div>
													<div className="result-email">
														{foundUser.email} · {foundUser.role}
													</div>
												</div>
												<button
													className="add-btn"
													onClick={handleAdd}>
													+ Add
												</button>
											</div>
										)}

										<div
											className="search-msg msg-info"
											style={{ marginTop: foundUser || msg ? 0 : 14 }}>
											Try: priya@craftcater.com · arjun@craftcater.com ·
											sneha@craftcater.com
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Row 4: Meta */}
					<div
						className="grid2"
						style={{ animationDelay: '150ms' }}>
						<div className="sec-card">
							<div className="sec-label">Event Meta</div>
							<div className="info-row">
								<div className="info-key">Event Code</div>
								<div className="info-val mono">{ev.eventCode}</div>
							</div>
							<div className="info-row">
								<div className="info-key">Event ID</div>
								<div
									className="info-val mono"
									style={{ fontSize: 11 }}>
									{ev._id}
								</div>
							</div>
							<div className="info-row">
								<div className="info-key">Created At</div>
								<div className="info-val sm">
									{formatDate(ev.createdAt)} · {formatTime(ev.createdAt)}
								</div>
							</div>
						</div>

						<div className="sec-card">
							<div className="sec-label">Financials</div>
							<div className="info-row">
								<div className="info-key">GST Rate</div>
								<div className="info-val">{ev.billing.gstRate}%</div>
							</div>
							<div className="info-row">
								<div className="info-key">Payments</div>
								<div
									className="info-val sm"
									style={{
										color: ev.payments.length === 0 ? T.muted : T.primary,
									}}>
									{!ev.payment
										? 'No payment record'
										: `₹${ev.payment.totalPaid} / ₹${ev.payment.totalPayable}`}
								</div>
							</div>
							<div className="info-row">
								<div className="info-key">Guests Registered</div>
								<div
									className="info-val sm"
									style={{
										color: ev.guests.length === 0 ? T.muted : T.primary,
									}}>
									{ev.guests.length === 0
										? 'None yet'
										: ev.guests.length + ' guest(s)'}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
