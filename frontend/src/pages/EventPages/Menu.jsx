import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import axiosInstance from '../../lib/axios';
import { MENU_TIERS } from '../../../../backend/consts/menuOptions'; // adjust path if needed
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// ── Collab config ──────────────────────────────────────────────────────────────
const WS_BASE = import.meta.env?.VITE_COLLAB_WS ?? 'ws://localhost:4000/collab';
const ROOM_NAME = 'menu-collab-global';

// ── User colour palette (vivid, distinct, readable on both light & dark) ───────
const PALETTE = [
	'#E63946',
	'#2196F3',
	'#4CAF50',
	'#FF9800',
	'#9C27B0',
	'#00BCD4',
	'#FF5722',
	'#8BC34A',
	'#E91E63',
	'#3F51B5',
	'#009688',
	'#FFC107',
	'#673AB7',
	'#F44336',
	'#03A9F4',
];

/** Deterministic colour from any string */
function strToColor(str = '') {
	let h = 0;
	for (let i = 0; i < str.length; i++)
		h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
	return PALETTE[Math.abs(h) % PALETTE.length];
}

/** Initials from a name string */
function initials(name = '') {
	if (typeof name !== 'string') return '??';

	const clean = name.trim();
	if (!clean) return '??';

	const parts = clean.split(/\s+/);

	return parts.length >= 2
		? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
		: clean.slice(0, 2).toUpperCase();
}

// ── Theme ──────────────────────────────────────────────────────────────────────
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
	selCard: '#0A1F44',
	selText: '#FFFFFF',
	trayBg: '#0A1F44',
	trayBorder: '#C9973A',
	heroText: '#FFFFFF',
	heroMuted: 'rgba(255,255,255,0.38)',
	tickerBadgeBg: '#C9973A',
	tickerBadgeText: '#0A1F44',
	tickerText: 'rgba(255,255,255,0.22)',
	tickerTextStrong: 'rgba(255,255,255,0.58)',
	kpiBg: 'rgba(255,255,255,0.06)',
	kpiBorder: 'rgba(255,255,255,0.09)',
};

const TIERS = {
	Standard: { color: '#2952A3', bg: '#E8EEF8', border: '#B8CCEA' },
	Premium: { color: '#A07820', bg: '#F5EDD5', border: '#DFC070' },
	Elite: { color: '#0A1F44', bg: '#DCE6F5', border: '#8AAAD8' },
};

const CAT_META = {
	Starter: { icon: '✦', tagline: 'Whets the appetite' },
	'Main Course': { icon: '◈', tagline: 'Heart of the feast' },
	Breads: { icon: '▲', tagline: 'Baked to perfection' },
	'Rice & Biryani': { icon: '●', tagline: 'Aromatic grains' },
	Dessert: { icon: '♦', tagline: 'Sweet finale' },
	Beverage: { icon: '○', tagline: 'Sip & refresh' },
	'Live Counter': { icon: '⬡', tagline: 'Live experience' },
	Snacks: { icon: '◇', tagline: 'Light bites' },
	Other: { icon: '·', tagline: 'Finishing touches' },
};

// ── CSS ────────────────────────────────────────────────────────────────────────
const buildCSS = (T) => `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body,#root{background:${T.pageBg}}
.app{font-family:'DM Sans',sans-serif;background:${T.pageBg};color:${T.primary};min-height:100vh;overflow-x:hidden}

/* hero */
.hero{background:${T.heroBg};position:relative;overflow:hidden}
.hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:60px 60px}
.hero-glow{position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.2) 0%,transparent 65%);top:-300px;right:-150px;pointer-events:none}
.hero-glow2{position:absolute;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(41,82,163,0.35) 0%,transparent 65%);bottom:-100px;left:15%;pointer-events:none}
.hero-content{position:relative;z-index:2;max-width:1440px;margin:0 auto;padding:88px 64px 0;display:grid;grid-template-columns:1fr 270px;gap:48px;align-items:start}
.eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:${T.accent2};text-transform:uppercase;margin-bottom:28px}
.eyebrow::before{content:'';width:32px;height:1px;background:${T.accent2}}
.h1{font-family:'Playfair Display',serif;font-size:clamp(60px,8.5vw,112px);font-weight:900;line-height:0.88;color:${T.heroText};letter-spacing:-4px}
.h1 .outline{display:block;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,0.2);padding-left:68px;margin-top:4px}
.h1 .sub{display:block;font-family:'Playfair Display',serif;font-weight:400;font-style:italic;font-size:clamp(20px,2.8vw,36px);color:${T.accent};letter-spacing:0px;padding-left:128px;margin-top:14px}
.hero-desc{margin-top:36px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:${T.heroMuted};text-transform:uppercase}
.kpi-col{display:flex;flex-direction:column;gap:3px;padding-top:88px}
.kpi{background:${T.kpiBg};border:1px solid ${T.kpiBorder};padding:20px 26px;transition:all 0.2s}
.kpi:hover{background:rgba(255,255,255,0.1);border-color:rgba(201,151,58,0.3)}
.kpi-n{font-family:'Playfair Display',serif;font-size:42px;font-weight:900;color:${T.accent2};line-height:1}
.kpi-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:5px}
.ticker-row{position:relative;z-index:2;margin-top:60px;border-top:1px solid rgba(255,255,255,0.07);display:flex;overflow:hidden}
.t-badge{background:${T.tickerBadgeBg};color:${T.tickerBadgeText};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;font-weight:500;padding:12px 20px;white-space:nowrap;flex-shrink:0;text-transform:uppercase}
.t-scroll{flex:1;overflow:hidden;display:flex;align-items:center}
.t-track{display:flex;white-space:nowrap;animation:scroll 30s linear infinite}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.t-item{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;color:${T.tickerText};padding:12px 32px;border-right:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.t-item b{color:${T.tickerTextStrong};font-weight:500}

/* sticky nav */
.snav{position:sticky;top:0;z-index:50;background:${T.navBg};backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid ${T.border};box-shadow:0 2px 20px rgba(10,31,68,0.07)}
.snav-inner{max-width:1440px;margin:0 auto;padding:0 64px;display:flex;align-items:stretch;justify-content:space-between;gap:16px}
.scats{display:flex;overflow-x:auto;scrollbar-width:none}
.scats::-webkit-scrollbar{display:none}
.scat{padding:0 16px;height:56px;display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;color:${T.mutedLight};border:none;background:none;cursor:pointer;border-bottom:3px solid transparent;transition:all 0.18s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.scat:hover{color:${T.primary}}
.scat.on{color:${T.primary};border-bottom-color:${T.primary}}
.snav-right{display:flex;align-items:center;gap:16px;flex-shrink:0;padding:8px 0}

/* presence avatar bar */
.presence{display:flex;align-items:center;gap:8px;padding:0 16px;border-left:1px solid ${T.border};border-right:1px solid ${T.border}}
.presence-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.mutedLight};text-transform:uppercase;white-space:nowrap}
.avatar-stack{display:flex;align-items:center}
.avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:10px;font-weight:700;color:#fff;border:2.5px solid ${T.navBg};margin-left:-10px;cursor:default;position:relative;transition:transform 0.15s;flex-shrink:0;letter-spacing:0;z-index:1}
.avatar:first-child{margin-left:0}
.avatar:hover{transform:scale(1.18);z-index:10}
.avatar.me{border-color:${T.accent}}
.avatar-tip{position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);background:#0A1F44;color:#fff;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;padding:4px 10px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;border-radius:2px;z-index:100}
.avatar-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#0A1F44}
.avatar:hover .avatar-tip{opacity:1}

/* connection dot */
.conn-badge{display:flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:${T.mutedLight};text-transform:uppercase;white-space:nowrap}
.conn-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background 0.3s}
.conn-dot.on{background:#2ECC71}
.conn-dot.off{background:#bbb}

.stiers{display:flex;align-items:center;gap:8px}
.tbtn{height:30px;padding:0 14px;border-radius:100px;font-size:10px;letter-spacing:1.5px;font-weight:500;cursor:pointer;border:1.5px solid;transition:all 0.15s;font-family:'DM Sans',sans-serif}

/* content */
.content{max-width:1440px;margin:0 auto;padding:64px 64px 180px}
.sec{margin-bottom:80px}
.sec-head{display:flex;align-items:flex-end;gap:0;margin-bottom:32px;padding-bottom:18px;border-bottom:1px solid ${T.border};position:relative}
.sec-head::after{content:'';position:absolute;bottom:-1px;left:0;width:72px;height:2px;background:${T.primary}}
.sec-num{font-family:'Playfair Display',serif;font-size:90px;font-weight:900;line-height:1;color:rgba(10,31,68,0.06);letter-spacing:-5px;margin-right:-8px;user-select:none;flex-shrink:0}
.sec-meta{padding-bottom:8px}
.sec-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:${T.primary};letter-spacing:-0.5px;line-height:1}
.sec-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.muted};text-transform:uppercase;margin-top:7px}
.sec-cnt{margin-left:auto;padding-bottom:8px;font-family:'Playfair Display',serif;font-size:58px;font-weight:900;color:rgba(10,31,68,0.06);letter-spacing:-3px;line-height:1;flex-shrink:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:12px}

/* card */
.card{background:${T.cardBg};border:1.5px solid ${T.border};padding:24px 24px 20px;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.25s cubic-bezier(.16,1,.3,1),box-shadow 0.25s cubic-bezier(.16,1,.3,1),border-color 0.2s,background 0.2s;animation:rise 0.45s ease both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.card-bar{position:absolute;top:0;left:0;right:0;height:3px;transform:scaleX(0);transform-origin:left;transition:transform 0.3s cubic-bezier(.16,1,.3,1),background 0.2s}
.card:hover .card-bar{transform:scaleX(1);background:linear-gradient(90deg,${T.primary} 0%,#2952A3 100%)}
.card.sel .card-bar{transform:scaleX(1)}
.card:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(10,31,68,0.11),0 3px 10px rgba(10,31,68,0.06);border-color:${T.borderStrong}}
.card.sel{background:${T.selCard};border-color:${T.selCard};transform:translateY(-3px);box-shadow:0 18px 56px rgba(10,31,68,0.32),0 5px 14px rgba(10,31,68,0.18)}
.ctop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
.cname{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${T.primary};line-height:1.2;flex:1;transition:color 0.2s}
.card.sel .cname{color:${T.selText}}
.cfoot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:28px}
.tloz{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;font-weight:500;padding:4px 10px;text-transform:uppercase;border:1px solid;transition:all 0.2s;flex-shrink:0}
.card.sel .tloz{color:rgba(255,255,255,0.55)!important;background:rgba(255,255,255,0.08)!important;border-color:rgba(255,255,255,0.15)!important}
.veg{width:14px;height:14px;border:1.5px solid #2E7D32;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.veg::after{content:'';width:6px;height:6px;border-radius:50%;background:#2E7D32}
.card.sel .veg{border-color:rgba(255,255,255,0.3)}
.card.sel .veg::after{background:rgba(255,255,255,0.3)}
.ck{width:24px;height:24px;border-radius:50%;background:${T.accent2};display:flex;align-items:center;justify-content:center;color:${T.primary};font-size:12px;font-weight:700;opacity:0;transform:scale(0) rotate(-90deg);transition:all 0.3s cubic-bezier(.16,1,.3,1);flex-shrink:0}
.card.sel .ck{opacity:1;transform:scale(1) rotate(0deg)}

/* who-selected dots on each card */
.card-users{display:flex;align-items:center;margin-left:auto}
.card-av{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:8px;font-weight:700;color:#fff;border:2px solid rgba(255,255,255,0.3);margin-left:-6px;flex-shrink:0;position:relative;cursor:default;transition:transform 0.15s;z-index:1}
.card-av:first-child{margin-left:0}
.card-av:hover{transform:scale(1.2);z-index:10}
.card-av-tip{position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:#0A1F44;color:#fff;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;padding:3px 8px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;border-radius:2px;z-index:20}
.card-av-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:4px solid transparent;border-top-color:#0A1F44}
.card-av:hover .card-av-tip{opacity:1}

/* tray */
.tray{position:fixed;bottom:0;left:0;right:0;z-index:100;transform:translateY(110%);transition:transform 0.5s cubic-bezier(.16,1,.3,1)}
.tray.up{transform:translateY(0)}
.tray-body{background:${T.trayBg};border-top:2px solid ${T.trayBorder};padding:20px 64px;display:flex;align-items:center;gap:36px;flex-wrap:wrap}
.tn{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;color:${T.accent2};line-height:1;flex-shrink:0}
.tinfo{flex:1;min-width:0}
.tinfo-h{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-bottom:6px}
.tdishes{font-size:12px;color:rgba(255,255,255,0.32);line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.tdishes b{color:rgba(255,255,255,0.62);font-weight:400}
.clrbtn{background:none;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.35);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;padding:11px 18px;transition:all 0.15s;flex-shrink:0;margin-left:auto}
.clrbtn:hover{border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.65)}
.empty{text-align:center;padding:100px 0;font-family:'Playfair Display',serif;font-size:24px;font-style:italic;color:rgba(10,31,68,0.18)}

@media(max-width:768px){
  .hero-content{padding:48px 24px 0;grid-template-columns:1fr}
  .snav-inner,.content{padding-left:24px;padding-right:24px}
  .tray-body{padding:16px 24px}
  .presence-label{display:none}
}
`;

// ── Small reusable components ──────────────────────────────────────────────────
const NavAvatar = ({ name, color, isMe }) => (
	<div
		className={`avatar${isMe ? ' me' : ''}`}
		style={{ background: color }}>
		{initials(name)}
		<div className="avatar-tip">{isMe ? `${name} (you)` : name}</div>
	</div>
);

const CardUserDot = ({ name, color }) => (
	<div
		className="card-av"
		style={{ background: color }}>
		{initials(name)}
		<div className="card-av-tip">{name}</div>
	</div>
);

// ══════════════════════════════════════════════════════════════════════════════
const Menu = () => {

	const [apiMenu, setApiMenu] = useState([]);
	const inputJson = {
		"tier": localStorage.getItem('selectedTier') || 'Standard',
		"jainPercentage": 20,
		"headcount": 200,
		"eventType": "Birthday"
	};
	const navigate = useNavigate();
	const [currentTier, setCurrentTier] = useState(() => {
		const saved = localStorage.getItem('selectedTier');
		return saved || 'Standard';
	});
	useEffect(() => {
		localStorage.setItem('selectedTier', currentTier);
	}, [currentTier]);
	const { id } = useParams();
	// ── Read current user from localStorage ───────────────────────────────────
	// Expects localStorage.user = JSON with { user: 'name' } or { name: 'name' }
	const currentUser = useMemo(() => {
		try {
			const raw = localStorage.getItem('user');
			if (!raw) return 'Guest';

			const parsed = JSON.parse(raw);

			let name =
				typeof parsed === 'string' ? parsed : parsed?.user || parsed?.name;

			if (typeof name !== 'string') return 'Guest';

			return name.trim() || 'Guest';
		} catch {
			return 'Guest';
		}
	}, []);
	useEffect(() => {
		const getAimenu = async () => {
			try {
				const response = await axiosInstance.post(`http://127.0.0.1:8000/recommend-menu`, {
					inputJson
				});
				setApiMenu(response.data);
			} catch (error) {
				console.error(error);
			}
		};
		getAimenu();
	}, []);
	const myColor = useMemo(() => strToColor(currentUser), [currentUser]);

	// ── UI state ──────────────────────────────────────────────────────────────
	const [activeCat, setActiveCat] = useState('All');
	const [menuItems, setMenuItems] = useState([]);
	const [tiers, setTiers] = useState(new Set(['Standard', 'Premium', 'Elite']));
	const [connected, setConnected] = useState(false);

	// Current user's own selections (local)
	// Initialize from localStorage
	const [sel, setSel] = useState(() => {
		const saved = localStorage.getItem('selectedMenuItems');
		if (!saved) return new Set();
		try {
			console.log(sel);
			return new Set(JSON.parse(saved));
		} catch {
			return new Set();
		}
	});

	// Update localStorage whenever selection changes
	useEffect(() => {
		localStorage.setItem('selectedMenuItems', JSON.stringify([...sel]));
	}, [sel]);

	// All OTHER connected users: Map<clientId, { name, color, selected: Set<id> }>
	const [peers, setPeers] = useState(new Map());

	// ── Refs ──────────────────────────────────────────────────────────────────
	const providerRef = useRef(null);

	// ── Yjs + Awareness ───────────────────────────────────────────────────────
	useEffect(() => {
		const ydoc = new Y.Doc();
		const provider = new WebsocketProvider(WS_BASE, ROOM_NAME, ydoc, {
			connect: true,
		});
		providerRef.current = provider;

		const { awareness } = provider;

		// Announce ourselves immediately with empty selection
		awareness.setLocalStateField('user', {
			name: currentUser,
			color: myColor,
			selected: [],
		});

		// Rebuild peer map on every awareness update
		const onAwarenessChange = () => {
			const myId = awareness.clientID;
			const states = awareness.getStates();
			const nextPeers = new Map();

			states.forEach((state, clientId) => {
				if (clientId === myId) return; // skip self
				const u = state?.user;
				if (!u?.name) return;
				nextPeers.set(clientId, {
					name: u.name,
					color: u.color || strToColor(u.name),
					selected: new Set(Array.isArray(u.selected) ? u.selected : []),
				});
			});

			setPeers(nextPeers);
		};

		awareness.on('change', onAwarenessChange);
		provider.on('status', ({ status }) => setConnected(status === 'connected'));

		return () => {
			awareness.off('change', onAwarenessChange);
			provider.disconnect();
			provider.destroy();
			ydoc.destroy();
		};
		// stable refs — intentionally run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Whenever OUR selection changes → push to awareness so peers can see it
	useEffect(() => {
		const provider = providerRef.current;
		if (!provider) return;
		provider.awareness.setLocalStateField('user', {
			name: currentUser,
			color: myColor,
			selected: [...sel],
		});
	}, [sel, currentUser, myColor]);

	// ── Data fetch ────────────────────────────────────────────────────────────

	const fetchMenu = async () => {
		try {
			const response = await axiosInstance.get('/menu');
			console.log(response.data);
			setMenuItems(response.data);
		} catch (error) {
			console.error('Error fetching menu data:', error);
		}
	};

	useEffect(() => {
		fetchMenu();
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────────────
	const toggle = useCallback(
		(id) => {
			setSel((prev) => {
				const next = new Set(prev);

				// if already selected → allow remove
				if (next.has(id)) {
					next.delete(id);
					return next;
				}

				// find item
				const item = menuItems.find((i) => i._id === id);
				if (!item) return prev;

				const category = item.category || 'Other';

				// count current selections in this category
				let count = 0;
				prev.forEach((selId) => {
					const selItem = menuItems.find((i) => i._id === selId);
					if ((selItem?.category || 'Other') === category) {
						count++;
					}
				});

				// get limit
				const limit = MENU_TIERS[currentTier]?.limits?.[category];

				// if limit exists and exceeded → block
				if (limit !== undefined && count >= limit) {
					return prev; // ❌ do nothing
				}

				next.add(id);
				return next;
			});
		},
		[menuItems, currentTier],
	);

	const clearAll = useCallback(() => setSel(new Set()), []);

	// ── Derived data ──────────────────────────────────────────────────────────
	const allCats = useMemo(
		() => [...new Set(menuItems.map((i) => i.category))],
		[menuItems],
	);

	// 1. Updated Filter Logic
	const filtered = useMemo(() => {
		if (!menuItems.length) return [];

		return menuItems.filter((i) => {
			// CATEGORY MATCH
			// Handles "Starter" vs "starter" safely
			console.log('Item:', i._id);
			const itemCat = (i.category || 'Other').toLowerCase();
			const activeCatLower = activeCat.toLowerCase();
			const catMatch = activeCatLower === 'all' || itemCat === activeCatLower;

			// TIER MATCH
			// Since your object MIGHT not have a tier, we default it to 'Standard'
			// so it doesn't get hidden by the tier filters.
			const itemTier = i.tier || 'Standard';
			const tierMatch = itemTier === currentTier;

			return catMatch && tierMatch;
		});
	}, [activeCat, tiers, menuItems]);
	useEffect(() => {
		if (!menuItems.length) return;

		setSel((prev) => {
			const newSel = new Set();
			const categoryCount = {};

			for (let id of prev) {
				const item = menuItems.find((i) => i._id === id);
				if (!item) continue;

				const category = item.category || 'Other';
				const limit = MENU_TIERS[currentTier]?.limits?.[category];

				// initialize count
				if (!categoryCount[category]) categoryCount[category] = 0;

				// if under limit → keep it
				if (limit === undefined || categoryCount[category] < limit) {
					newSel.add(id);
					categoryCount[category]++;
				}
				// else skip (auto-remove extra items)
			}

			return newSel;
		});
	}, [currentTier, menuItems]);
	// 2. Updated Grouping Logic
	const grouped = useMemo(() => {
		const m = {};
		filtered.forEach((i) => {
			const catName = i.category || 'Other';
			if (!m[catName]) m[catName] = [];
			m[catName].push(i);
		});
		return m;
	}, [filtered]);

	// All users online (me first, then peers)
	const allUsers = useMemo(() => {
		const list = [{ name: currentUser, color: myColor, isMe: true }];
		peers.forEach((p) =>
			list.push({ name: p.name, color: p.color, isMe: false }),
		);
		return list;
	}, [currentUser, myColor, peers]);

	// For a given item id → list of { name, color } of users who selected it
	const getUsersForItem = useCallback(
		(id) => {
			const result = [];
			if (sel.has(id))
				result.push({ name: `${currentUser} (you)`, color: myColor });
			peers.forEach((p) => {
				if (p.selected.has(id)) result.push({ name: p.name, color: p.color });
			});
			return result;
		},
		[sel, peers, currentUser, myColor],
	);

	const selItems = menuItems.filter((i) => sel.has(i._id));
	const ticker = menuItems.filter((_, i) => i % 4 === 0);
	const buildSelections = () => {
		const result = {};

		menuItems.forEach((item) => {
			if (!sel.has(item._id)) return;

			const cat = item.category || 'Other';

			if (!result[cat]) result[cat] = [];

			result[cat].push(item._id);
		});

		return result;
	};
	// ── Render ────────────────────────────────────────────────────────────────
	const Confirm = async () => {
		try {
			const selections = buildSelections();
			await axiosInstance.patch(`/events/${id}/confirm`, {
				baseTier: currentTier,
				selections,
			});
			navigate(-1);
			console.log('Enquiry confirmed');

			setSel(new Set());
		} catch (err) {
			console.error(err);
		}
	};
	return (
		<>
			<style>{buildCSS(T)}</style>
			<div className="app">
				{/* ── hero ── */}
				<div className="hero">
					<div className="hero-grid" />
					<div className="hero-glow" />
					<div className="hero-glow2" />
					<div className="hero-content">
						<div>
							<div className="eyebrow">Hackniche Hospitality · 2025</div>
							<h1 className="h1">
								Craft<span className="outline">Cater</span>
								<span className="sub">Fine Indian Catering</span>
							</h1>
							<p className="hero-desc">
								{menuItems.length} dishes · 9 categories · 3 tiers
							</p>
						</div>
						<div className="kpi-col">
							{[
								{ n: menuItems.length, l: 'Total Dishes' },
								{
									n: menuItems.filter((i) => i.tier === 'Elite').length,
									l: 'Elite Items',
								},
								{ n: menuItems.filter((i) => i.isVeg).length, l: 'Vegetarian' },
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
					<div className="ticker-row">
						<div className="t-badge">On the Menu</div>
						<div className="t-scroll">
							<div className="t-track">
								{[...ticker, ...ticker].map((item, i) => (
									<div
										className="t-item"
										key={i}>
										<b>{item.name}</b>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ── sticky nav ── */}
				<div className="snav">
					<div className="snav-inner">
						{/* category tabs */}
						<div className="scats">
							{['All', ...allCats].map((cat) => (
								<button
									key={cat}
									className={`scat ${activeCat === cat ? 'on' : ''}`}
									onClick={() => setActiveCat(cat)}>
									{cat !== 'All' && (
										<span style={{ fontSize: '10px' }}>
											{CAT_META[cat]?.icon}
										</span>
									)}
									{cat}
								</button>
							))}
						</div>

						<div className="snav-right">
							{/* ── who's online ── */}
							<div className="presence">
								<span className="presence-label">{allUsers.length} online</span>
								<div className="avatar-stack">
									{allUsers.map((u, i) => (
										<NavAvatar
											key={u.name + i}
											{...u}
										/>
									))}
								</div>
							</div>

							{/* tier filters */}
							<div className="stiers">
								{['Standard', 'Premium', 'Elite'].map((t) => {
									const on = currentTier === t;
									const cfg = TIERS[t];
									// console.log(cfg.color)
									return (
										<button
											key={t}
											className="tbtn"
											onClick={() => setCurrentTier(t)}
											style={{
												color: on ? cfg.color : 'rgba(10,31,68,0.25)',
												background: on ? cfg.bg : 'transparent',
												borderColor: on ? cfg.border : 'rgba(10,31,68,0.1)',
											}}>
											{t}
										</button>
									);
								})}
							</div>

							{/* connection status */}
							<div className="conn-badge">
								<span className={`conn-dot ${connected ? 'on' : 'off'}`} />
								{connected ? 'Live' : 'Connecting…'}
							</div>
						</div>
					</div>
				</div>

				{/* ── menu grid ── */}
				<div className="content">
					{Object.keys(grouped).length === 0 ? (
						<div className="empty">No dishes match the current filters.</div>
					) : (
						Object.entries(grouped).map(([cat, items], idx) => (
							<div
								className="sec"
								key={cat}>
								<div className="sec-head">
									<div className="sec-num">0{idx + 1}</div>
									<div className="sec-meta">
										<div className="sec-title">
											{CAT_META[cat]?.icon} {cat}
										</div>
										<div className="sec-tag">
											{CAT_META[cat]?.tagline} · {items.length} items
										</div>
									</div>
									<div className="sec-cnt">{items.length}</div>
								</div>
								<div className="grid">
									{items.map((item, ci) => {
										// console.log('Item: ', item);
										const id = item._id;
										const isSel = sel.has(id);
										// const cfg = TIERS[item.tier];
										const cardUsers = getUsersForItem(id);
										// top bar colour: my colour if I selected it, else first peer's colour
										const barColor =
											cardUsers.length > 0 ? cardUsers[0].color : null;

										return (
											<div
												key={id}
												className={`card ${isSel ? 'sel' : ''}`}
												style={{ animationDelay: `${ci * 35}ms` }}
												onClick={() => toggle(id)}>
												<div
													className="card-bar"
													style={
														barColor
															? {
																background: barColor,
																transform: 'scaleX(1)',
															}
															: {}
													}
												/>
												<div className="ctop">
													<div className="cname">{item.name}</div>
												</div>
												<div className="cfoot">
													{item.isVeg && <span className="veg" />}
													<div className="ck">✓</div>

													{/* ── per-card user dots ── */}
													{cardUsers.length > 0 && (
														<div className="card-users">
															{cardUsers.map((u, i) => (
																<CardUserDot
																	key={u.name + i}
																	name={u.name}
																	color={u.color}
																/>
															))}
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))
					)}
				</div>

				{/* ── selection tray ── */}
				<div className={`tray ${sel.size > 0 ? 'up' : ''}`}>
					<div className="tray-body">
						<div className="tn">{sel.size}</div>
						<div className="tinfo">
							<div className="tinfo-h">Your Selections</div>
							<div className="tdishes">
								{selItems.map((i, idx) => (
									<span key={i._id}>
										<b>{i.name}</b>
										{idx < selItems.length - 1 ? ' · ' : ''}
									</span>
								))}
							</div>
						</div>
						<button
							className="clrbtn"
							onClick={clearAll}>
							Clear All
						</button>
						<button
							className="clrbtn"
							onClick={Confirm}>
							Confirm
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Menu;
