import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
// ── THEME: NAVY & IVORY ──────────────────────────────────────────────────────
const T = {
	pageBg: '#E8E4DC',
	heroBg: '#0A1F44',
	cardBg: '#F5F1E8',
	primary: '#0A1F44',
	accent: '#C9973A',
	accent2: '#E8B84B',
	muted: '#5A6A8A',
	mutedLight: 'rgba(10,31,68,0.35)',
	border: 'rgba(10,31,68,0.12)',
	borderStrong: 'rgba(10,31,68,0.28)',
	heroText: '#FFFFFF',
	heroMuted: 'rgba(255,255,255,0.38)',
	tickerBadgeBg: '#C9973A',
	tickerBadgeText: '#0A1F44',
	tickerText: 'rgba(255,255,255,0.22)',
	tickerTextStrong: 'rgba(255,255,255,0.58)',
	kpiBg: 'rgba(255,255,255,0.06)',
	kpiBorder: 'rgba(255,255,255,0.09)',
};

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
	TEMPORARY_ENQUIRY: {
		label: 'Temporary Enquiry',
		short: 'Enquiry',
		color: '#7C3AED',
		bg: '#EDE9FE',
		border: '#C4B5FD',
		dot: '#7C3AED',
		icon: '◎',
	},
	ENQUIRY_CONFIRMED: {
		label: 'Enquiry Confirmed',
		short: 'Confirmed',
		color: '#2563EB',
		bg: '#DBEAFE',
		border: '#93C5FD',
		dot: '#2563EB',
		icon: '◉',
	},

	BOOKED: {
		label: 'Booked',
		short: 'Booked',
		color: '#059669',
		bg: '#D1FAE5',
		border: '#6EE7B7',
		dot: '#059669',
		icon: '◆',
	},
	IN_PROGRESS: {
		label: 'In Progress',
		short: 'Live',
		color: '#DC2626',
		bg: '#FEE2E2',
		border: '#FCA5A5',
		dot: '#DC2626',
		icon: '▶',
	},
	COMPLETED: {
		label: 'Completed',
		short: 'Done',
		color: '#374151',
		bg: '#F3F4F6',
		border: '#D1D5DB',
		dot: '#374151',
		icon: '✓',
	},
	CANCELLED: {
		label: 'Cancelled',
		short: 'Cancelled',
		color: '#9CA3AF',
		bg: '#F9FAFB',
		border: '#E5E7EB',
		dot: '#9CA3AF',
		icon: '✕',
	},
};

const EVENT_TYPES = [
	'Wedding',
	'Reception',
	'Engagement',
	'Birthday',
	'Corporate',
	'Anniversary',
	'Farewell',
	'Conference',
	'Other',
];

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

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_EVENTS = [
	{
		_id: '1',
		eventCode: 'BNQ-2025-0001',
		partyName: 'Sharma Wedding',
		eventType: 'Wedding',
		status: 'BOOKED',
		client: {
			name: 'Rajesh Sharma',
			phone: '+91 98765 43210',
			email: 'rajesh.sharma@gmail.com',
		},
		schedule: {
			startDateTime: new Date('2025-04-12T18:00:00'),
			endDateTime: new Date('2025-04-12T23:00:00'),
		},
		headcount: { expected: 450, arrived: 0 },
		venue: { name: 'Grand Ballroom A' },
		eventManager: { name: 'Priya Kapoor' },
		billing: { gstNumber: '27AABCS1429B1ZB' },
		payments: [{ amount: 50000 }, { amount: 30000 }],
	},
	{
		_id: '2',
		eventCode: 'BNQ-2025-0002',
		partyName: 'TechCorp Annual Gala',
		eventType: 'Corporate',
		status: 'ENQUIRY_CONFIRMED',
		client: {
			name: 'Anita Mehta',
			phone: '+91 91234 56789',
			email: 'anita.mehta@techcorp.in',
		},
		schedule: {
			startDateTime: new Date('2025-04-20T19:00:00'),
			endDateTime: new Date('2025-04-20T22:30:00'),
		},
		headcount: { expected: 200, arrived: 0 },
		venue: { name: 'Conference Hall B' },
		eventManager: { name: 'Vikram Singh' },
		billing: {
			companyName: 'TechCorp India Ltd.',
			gstNumber: '07AAACT2727Q1Z4',
		},
		payments: [],
	},
	{
		_id: '3',
		eventCode: 'BNQ-2025-0003',
		partyName: 'Patel Reception',
		eventType: 'Reception',
		status: 'BOOKED',
		client: {
			name: 'Suresh Patel',
			phone: '+91 99887 76655',
			email: 'suresh.patel@yahoo.com',
		},
		schedule: {
			startDateTime: new Date('2025-05-03T17:30:00'),
			endDateTime: new Date('2025-05-03T22:00:00'),
		},
		headcount: { expected: 350, arrived: 0 },
		venue: { name: 'Terrace Garden' },
		eventManager: { name: 'Priya Kapoor' },
		billing: {},
		payments: [{ amount: 75000 }],
	},
	{
		_id: '4',
		eventCode: 'BNQ-2025-0004',
		partyName: 'Gupta Birthday Bash',
		eventType: 'Birthday',
		status: 'TEMPORARY_ENQUIRY',
		client: {
			name: 'Meera Gupta',
			phone: '+91 98001 23456',
			email: 'meera.gupta@hotmail.com',
		},
		schedule: {
			startDateTime: new Date('2025-05-15T20:00:00'),
			endDateTime: new Date('2025-05-15T23:59:00'),
		},
		headcount: { expected: 120, arrived: 0 },
		venue: { name: 'Rooftop Lounge' },
		eventManager: { name: 'Arjun Nair' },
		billing: {},
		payments: [],
	},
	{
		_id: '5',
		eventCode: 'BNQ-2025-0005',
		partyName: 'Joshi Anniversary',
		eventType: 'Anniversary',
		status: 'IN_PROGRESS',
		client: {
			name: 'Dilip Joshi',
			phone: '+91 70123 45678',
			email: 'dilip.joshi@gmail.com',
		},
		schedule: {
			startDateTime: new Date('2025-03-25T19:00:00'),
			endDateTime: new Date('2025-03-25T22:00:00'),
		},
		headcount: { expected: 80, arrived: 72 },
		venue: { name: 'Crystal Room' },
		eventManager: { name: 'Vikram Singh' },
		billing: {},
		payments: [{ amount: 25000 }, { amount: 15000 }],
	},
	{
		_id: '6',
		eventCode: 'BNQ-2025-0006',
		partyName: 'Kapoor Farewell',
		eventType: 'Farewell',
		status: 'COMPLETED',
		client: {
			name: 'Neha Kapoor',
			phone: '+91 88776 65544',
			email: 'neha.kapoor@corporate.com',
		},
		schedule: {
			startDateTime: new Date('2025-03-10T18:00:00'),
			endDateTime: new Date('2025-03-10T21:00:00'),
		},
		headcount: { expected: 60, arrived: 58 },
		venue: { name: 'Private Dining Hall' },
		eventManager: { name: 'Priya Kapoor' },
		billing: {},
		payments: [{ amount: 18000 }],
	},
	{
		_id: '7',
		eventCode: 'BNQ-2025-0007',
		partyName: 'Verma Engagement',
		eventType: 'Engagement',
		status: 'CANCELLED',
		client: {
			name: 'Rohit Verma',
			phone: '+91 95544 33211',
			email: 'rohit.verma@gmail.com',
		},
		schedule: {
			startDateTime: new Date('2025-04-05T18:30:00'),
			endDateTime: new Date('2025-04-05T21:30:00'),
		},
		headcount: { expected: 150, arrived: 0 },
		venue: { name: 'Garden Pavilion' },
		eventManager: { name: 'Arjun Nair' },
		billing: {},
		payments: [{ amount: 10000 }],
		cancellation: { reason: 'Date Conflict' },
	},
	{
		_id: '8',
		eventCode: 'BNQ-2025-0008',
		partyName: 'StartupIndia Conference',
		eventType: 'Conference',
		status: 'BOOKED',
		client: {
			name: 'Kavita Iyer',
			phone: '+91 91111 22233',
			email: 'kavita@startupindia.org',
		},
		schedule: {
			startDateTime: new Date('2025-06-01T09:00:00'),
			endDateTime: new Date('2025-06-01T18:00:00'),
		},
		headcount: { expected: 300, arrived: 0 },
		venue: { name: 'Grand Ballroom B' },
		eventManager: { name: 'Vikram Singh' },
		billing: {
			companyName: 'StartupIndia Foundation',
			gstNumber: '27AABCS9999B1ZC',
		},
		payments: [{ amount: 100000 }, { amount: 50000 }],
	},
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(date) {
	return new Date(date).toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}
function fmtTime(date) {
	return new Date(date).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}
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

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body,#root{background:${T.pageBg};min-height:100vh}
.sd{font-family:'DM Sans',sans-serif;background:${T.pageBg};color:${T.primary};min-height:100vh;overflow-x:hidden}

/* HERO */
.sd-hero{background:${T.heroBg};position:relative;overflow:hidden}
.sd-hgrid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:55px 55px}
.sd-hglow{position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.18) 0%,transparent 65%);top:-250px;right:-100px;pointer-events:none}
.sd-hglow2{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(41,82,163,0.3) 0%,transparent 65%);bottom:-80px;left:10%;pointer-events:none}
.sd-hero-inner{position:relative;z-index:2;max-width:1440px;margin:0 auto;padding:56px 64px 0;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:start}
.sd-eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:${T.accent2};text-transform:uppercase;margin-bottom:22px}
.sd-eyebrow::before{content:'';width:28px;height:1px;background:${T.accent2}}
.sd-h1{font-family:'Playfair Display',serif;font-size:clamp(44px,6vw,82px);font-weight:900;line-height:0.9;color:#fff;letter-spacing:-3px}
.sd-h1 .outline{display:block;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,0.18);padding-left:48px;margin-top:4px}
.sd-h1 .sub{display:block;font-family:'Playfair Display',serif;font-weight:400;font-style:italic;font-size:clamp(16px,2vw,26px);color:${T.accent};letter-spacing:0px;padding-left:96px;margin-top:12px}
.sd-meta{margin-top:28px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.3);text-transform:uppercase;padding-bottom:56px}
.sd-date{color:${T.accent2};font-weight:500}

.kpi-col{display:flex;flex-direction:column;gap:3px;padding-top:56px}
.kpi{background:${T.kpiBg};border:1px solid ${T.kpiBorder};padding:18px 24px;transition:all 0.2s;min-width:160px}
.kpi:hover{background:rgba(255,255,255,0.09);border-color:rgba(201,151,58,0.3)}
.kpi-n{font-family:'Playfair Display',serif;font-size:38px;font-weight:900;color:${T.accent2};line-height:1}
.kpi-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:4px}

/* TICKER */
.sd-ticker{position:relative;z-index:2;border-top:1px solid rgba(255,255,255,0.07);display:flex;overflow:hidden}
.t-badge{background:${T.tickerBadgeBg};color:${T.tickerBadgeText};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;font-weight:500;padding:11px 18px;white-space:nowrap;flex-shrink:0;text-transform:uppercase}
.t-scroll{flex:1;overflow:hidden;display:flex;align-items:center}
.t-track{display:flex;white-space:nowrap;animation:scroll 28s linear infinite}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.t-item{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:${T.tickerText};padding:11px 28px;border-right:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.t-item b{color:${T.tickerTextStrong};font-weight:500}

/* FILTERS BAR */
.sd-filters{position:sticky;top:0;z-index:50;background:rgba(232,228,220,0.95);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${T.border};box-shadow:0 2px 20px rgba(10,31,68,0.07)}
.sd-filters-inner{max-width:1440px;margin:0 auto;padding:0 64px;display:flex;align-items:stretch;gap:0;overflow-x:auto;scrollbar-width:none}
.sd-filters-inner::-webkit-scrollbar{display:none}

.fchip{height:56px;padding:0 20px;display:flex;align-items:center;gap:10px;border:none;background:none;cursor:pointer;transition:all 0.18s;border-bottom:3px solid transparent;white-space:nowrap;flex-shrink:0}
.fchip:hover .fchip-label{color:${T.primary}}
.fchip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:transform 0.2s}
.fchip:hover .fchip-dot,.fchip.on .fchip-dot{transform:scale(1.35)}
.fchip-label{font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;color:${T.mutedLight};transition:color 0.15s}
.fchip.on .fchip-label{color:${T.primary}}
.fchip-count{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;background:rgba(10,31,68,0.07);color:${T.muted};letter-spacing:0;border-radius:2px}
.fchip.on .fchip-count{background:${T.primary};color:#fff}

.sd-search-wrap{margin-left:auto;display:flex;align-items:center;padding:0 0 0 20px;border-left:1px solid ${T.border};flex-shrink:0}
.sd-search{background:transparent;border:none;outline:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1.5px;color:${T.primary};width:200px;padding:0 12px}
.sd-search::placeholder{color:rgba(10,31,68,0.28);letter-spacing:1.5px}
.sd-search-icon{color:${T.muted};font-size:13px;flex-shrink:0}

/* CONTENT */
.sd-content{max-width:1440px;margin:0 auto;padding:40px 64px 120px}

/* SECTION HEADER */
.sd-sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sd-sec-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:${T.primary}}
.sd-sec-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.muted};text-transform:uppercase;margin-top:3px}
.sd-sec-count{font-family:'Playfair Display',serif;font-size:54px;font-weight:900;color:rgba(10,31,68,0.06);line-height:1;letter-spacing:-3px}

/* EVENT ROW */
.ev-list{display:flex;flex-direction:column;gap:10px;margin-bottom:48px}

.ev-row{background:${T.cardBg};border:1.5px solid ${T.border};display:grid;grid-template-columns:auto 1fr auto auto auto auto;align-items:center;gap:0;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.22s cubic-bezier(.16,1,.3,1),box-shadow 0.22s cubic-bezier(.16,1,.3,1),border-color 0.18s;animation:rowrise 0.4s ease both}
@keyframes rowrise{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.ev-row:hover{transform:translateX(4px);box-shadow:0 8px 32px rgba(10,31,68,0.1),0 2px 8px rgba(10,31,68,0.05);border-color:${T.borderStrong}}
.ev-row-bar{position:absolute;top:0;left:0;bottom:0;width:4px}

.ev-code{padding:20px 22px;border-right:1px solid ${T.border};flex-shrink:0;min-width:130px}
.ev-code-val{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1.5px;color:${T.muted};line-height:1}
.ev-code-type{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:9px;letter-spacing:1px;font-family:'DM Mono',monospace;color:rgba(10,31,68,0.28);text-transform:uppercase}

.ev-main{padding:18px 24px;min-width:0}
.ev-party{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${T.primary};letter-spacing:-0.3px;line-height:1.2}
.ev-client{font-size:12px;color:${T.muted};margin-top:3px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ev-client span{display:flex;align-items:center;gap:4px}

.ev-date{padding:18px 20px;border-left:1px solid ${T.border};text-align:center;min-width:130px;flex-shrink:0}
.ev-date-d{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:${T.primary};line-height:1}
.ev-date-m{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.muted};text-transform:uppercase;margin-top:2px}
.ev-date-t{font-family:'DM Mono',monospace;font-size:10px;color:rgba(10,31,68,0.4);margin-top:4px}

.ev-hc{padding:18px 20px;border-left:1px solid ${T.border};text-align:center;min-width:100px;flex-shrink:0}
.ev-hc-n{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:${T.primary};line-height:1}
.ev-hc-l{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;color:${T.muted};text-transform:uppercase;margin-top:3px}
.ev-hc-live{font-family:'DM Mono',monospace;font-size:9px;color:#DC2626;margin-top:2px}

.ev-manager{padding:18px 20px;border-left:1px solid ${T.border};min-width:120px;flex-shrink:0}
.ev-mgr-avatar{width:32px;height:32px;border-radius:50%;background:${T.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:14px;font-weight:700;margin-bottom:6px}
.ev-mgr-l{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;color:${T.muted};text-transform:uppercase;margin-bottom:3px}
.ev-mgr-n{font-size:11px;font-weight:500;color:${T.primary}}

.ev-status{padding:18px 22px;border-left:1px solid ${T.border};min-width:140px;flex-shrink:0}
.ev-status-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.5px;font-weight:500;text-transform:uppercase;border:1px solid;border-radius:2px}
.ev-status-icon{font-size:10px}
.ev-venue{margin-top:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(10,31,68,0.3);display:flex;align-items:center;gap:4px}

/* EMPTY */
.sd-empty{text-align:center;padding:80px 0;font-family:'Playfair Display',serif;font-size:22px;font-style:italic;color:rgba(10,31,68,0.18)}

/* CANCEL BADGE */
.cancel-note{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:rgba(10,31,68,0.35);margin-top:4px;text-transform:uppercase}

@media(max-width:900px){
  .sd-hero-inner{grid-template-columns:1fr;padding:40px 24px 0}
  .kpi-col{flex-direction:row;padding-top:24px}
  .sd-filters-inner,.sd-content{padding-left:20px;padding-right:20px}
  .ev-row{grid-template-columns:auto 1fr}
  .ev-date,.ev-hc,.ev-manager,.ev-status{display:none}
}
`;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SalesDashboard() {
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	// const events = propEvents || MOCK_EVENTS;
	const [activeStatus, setActiveStatus] = useState('ALL');
	const [searchQuery, setSearchQuery] = useState('');

	const today = new Date();

	useEffect(() => {
		const getEvents = async () => {
			try {
				const res = await axiosInstance.get('/events/');
				console.log('Fetched events:', res.data);
				setEvents(res.data);
			} catch (error) {
				console.error('Error fetching events:', error);
			}
		};
		getEvents();
	}, []);
	const todayStr = today.toLocaleDateString('en-IN', {
		weekday: 'long',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

	// KPI counts
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

	// Status counts
	const statusCounts = useMemo(() => {
		const c = { ALL: events.length };
		Object.keys(STATUS_CONFIG).forEach((s) => {
			c[s] = events.filter((e) => e.status === s).length;
		});
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
				e.client.name.toLowerCase().includes(q) ||
				e.eventType.toLowerCase().includes(q);
			return matchStatus && matchSearch;
		});
	}, [events, activeStatus, searchQuery]);

	// Ticker items
	const tickerItems = events.filter(
		(e) => e.status === 'BOOKED' || e.status === 'IN_PROGRESS',
	);

	return (
		<>
			<style>{CSS}</style>
			<div className="sd">
				{/* ── HERO ─────────────────────────────────────────────────────── */}
				<div className="sd-hero">
					<div className="sd-hgrid" />
					<div className="sd-hglow" />
					<div className="sd-hglow2" />
					<div className="sd-hero-inner">
						<div>
							<div className="sd-eyebrow">Banquet Pro · Sales Command</div>
							<h1 className="sd-h1">
								Sales
								<span className="outline">Pipeline</span>
								<span className="sub">Event Dashboard</span>
							</h1>
							<p className="sd-meta">
								<span className="sd-date">{todayStr}</span>
								{' · '}
								{events.length} events tracked
								{' · '}
								{events.filter((e) => e.status === 'IN_PROGRESS').length} live
								now
							</p>
						</div>
						<div className="kpi-col">
							{kpis.map((k) => (
								<div
									className="kpi"
									key={k.l}>
									<div className="kpi-n">{k.n}</div>
									<div className="kpi-l">{k.l}</div>
								</div>
							))}
						</div>
					</div>

					{/* Ticker */}
					<div className="sd-ticker">
						<div className="t-badge">Live Pipeline</div>
						<div className="t-scroll">
							<div className="t-track">
								{[...tickerItems, ...tickerItems].map((e, i) => {
									const cfg = STATUS_CONFIG[e.status];
									return (
										<div
											className="t-item"
											key={i}>
											<b>{e.partyName}</b>
											{' · '}
											{fmt(e.schedule.startDateTime)}
											{' · '}
											{e.headcount.expected} guests
											{' · '}
											<span style={{ color: cfg.dot, opacity: 0.7 }}>
												{cfg.short}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* ── FILTER BAR ───────────────────────────────────────────────── */}
				<div className="sd-filters">
					<div className="sd-filters-inner">
						{/* All */}
						<button
							className={`fchip ${activeStatus === 'ALL' ? 'on' : ''}`}
							onClick={() => setActiveStatus('ALL')}
							style={{
								borderBottomColor:
									activeStatus === 'ALL' ? T.primary : 'transparent',
							}}>
							<div
								className="fchip-dot"
								style={{ background: T.primary }}
							/>
							<span className="fchip-label">All Events</span>
							<span className="fchip-count">{statusCounts.ALL}</span>
						</button>

						{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
							<button
								key={key}
								className={`fchip ${activeStatus === key ? 'on' : ''}`}
								onClick={() => setActiveStatus(key)}
								style={{
									borderBottomColor:
										activeStatus === key ? cfg.color : 'transparent',
								}}>
								<div
									className="fchip-dot"
									style={{ background: cfg.dot }}
								/>
								<span className="fchip-label">{cfg.short}</span>
								<span
									className="fchip-count"
									style={
										activeStatus === key
											? { background: cfg.color, color: '#fff' }
											: {}
									}>
									{statusCounts[key]}
								</span>
							</button>
						))}

						{/* Search */}
						<div className="sd-search-wrap">
							<span className="sd-search-icon">⌕</span>
							<input
								className="sd-search"
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* ── CONTENT ──────────────────────────────────────────────────── */}
				<div className="sd-content">
					<div className="sd-sec-head">
						<div>
							<div className="sd-sec-title">
								{activeStatus === 'ALL'
									? 'All Events'
									: STATUS_CONFIG[activeStatus]?.label}
							</div>
							<div className="sd-sec-tag">
								{filtered.length} event{filtered.length !== 1 ? 's' : ''}
								{searchQuery ? ` · matching "${searchQuery}"` : ''}
							</div>
						</div>
						<div className="sd-sec-count">{filtered.length}</div>
					</div>

					{/* Event Rows */}
					<div className="ev-list">
						{filtered.length === 0 ? (
							<div className="sd-empty">No events match this filter.</div>
						) : (
							filtered.map((ev, idx) => {
								console.log('ev', ev.client.name);
								const cfg = STATUS_CONFIG[ev.status];
								const start = new Date(ev.schedule.startDateTime);
								const initials = ev.client.name
									.split(' ')
									.map((n) => n[0])
									.join('')
									.toUpperCase();

								return (
									<div
										className="ev-row"
										key={ev._id}
										onClick={() => navigate(`/events/${ev._id}`)}
										style={{ animationDelay: `${idx * 40}ms` }}>
										{/* Left color bar */}
										<div
											className="ev-row-bar"
											style={{ background: cfg.dot }}
										/>

										{/* Code + Type */}
										<div className="ev-code">
											<div className="ev-code-val">{ev.eventCode}</div>
											<div className="ev-code-type">
												<span>{EVENT_TYPE_ICONS[ev.eventType]}</span>
												<span>{ev.eventType}</span>
											</div>
										</div>

										{/* Main Info */}
										<div className="ev-main">
											<div className="ev-party">{ev.partyName}</div>
											<div className="ev-client">
												<span>
													<svg
														width="10"
														height="10"
														viewBox="0 0 16 16"
														fill="none">
														<circle
															cx="8"
															cy="6"
															r="3"
															stroke={T.muted}
															strokeWidth="1.5"
														/>
														<path
															d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
															stroke={T.muted}
															strokeWidth="1.5"
															strokeLinecap="round"
														/>
													</svg>
													{ev.client.name}
												</span>
												<span>
													<svg
														width="10"
														height="10"
														viewBox="0 0 16 16"
														fill="none">
														<path
															d="M3 3h10v10H3z"
															stroke={T.muted}
															strokeWidth="1.3"
														/>
													</svg>
													{ev.client.phone}
												</span>
												{ev.billing.companyName && (
													<span style={{ color: T.accent }}>
														🏢 {ev.billing.companyName}
													</span>
												)}
												{ev.billing.gstNumber && (
													<span
														style={{
															color: 'rgba(10,31,68,0.35)',
														}}>
														GST: {ev.billing.gstNumber}
													</span>
												)}
											</div>
										</div>

										{/* Date */}
										<div className="ev-date">
											<div className="ev-date-d">
												{start.getDate().toString().padStart(2, '0')}
											</div>
											<div className="ev-date-m">
												{start.toLocaleString('en-IN', {
													month: 'short',
												})}{' '}
												{start.getFullYear()}
											</div>
											<div className="ev-date-t">{fmtTime(start)}</div>
										</div>

										{/* Headcount */}
										<div className="ev-hc">
											<div className="ev-hc-n">{ev.headcount.expected}</div>
											<div className="ev-hc-l">Guests</div>
											{ev.status === 'IN_PROGRESS' &&
												ev.headcount.arrived > 0 && (
													<div className="ev-hc-live">
														▶ {ev.headcount.arrived} arrived
													</div>
												)}
										</div>

										{/* Manager */}
										<div className="ev-manager">
											{/* Check if eventManager is an object with a name, otherwise show a placeholder */}
											<div className="ev-mgr-avatar">
												{typeof ev.eventManager === 'object' ? initials : '?'}
											</div>
											<div className="ev-mgr-l">Manager</div>
											<div className="ev-mgr-n">
												{typeof ev.eventManager === 'object'
													? ev.eventManager.name.split(' ')[0]
													: 'Unassigned'}
											</div>
										</div>

										{/* Status */}
										<div className="ev-status">
											<div
												className="ev-status-chip"
												style={{
													color: cfg.color,
													background: cfg.bg,
													borderColor: cfg.border,
												}}>
												<span className="ev-status-icon">{cfg.icon}</span>
												{cfg.short}
											</div>
											{ev.venue?.name && (
												<div className="ev-venue">
													<span>◈</span>
													<span>{ev.venue.name}</span>
												</div>
											)}
											{ev.cancellation?.reason && (
												<div className="cancel-note">
													✕ {ev.cancellation.reason}
												</div>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</>
	);
}
