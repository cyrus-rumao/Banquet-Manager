/**
 * GuestEntry.jsx — Guest Check-In & QR Scanner Page
 *
 * Dependencies:  npm install axios html5-qrcode
 *
 * Props:
 *   eventId : string  — MongoDB ObjectId of the event; guests are fetched by this
 *
 * API contract (all at http://localhost:8080):
 *   POST  /api/dr/decrypt-data       body: { iv, data }  → { message, originalData }
 *   GET   /api/guests?eventId=<id>   → Guest[]
 *   PATCH /api/guests/:id/arrive     → updated Guest
 *
 * Stats are derived client-side from the guest list — no dedicated stats route.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../lib/axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams } from 'react-router-dom';


// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
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
    green: '#22c55e',
    red: '#ef4444',
    amber: '#f59e0b',
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const buildCSS = () => `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

.gre-app{background:${T.pageBg};min-height:100vh;font-family:'DM Sans',sans-serif;color:${T.primary}}

/* ── HERO ── */
.gre-hero{background:${T.heroBg};position:relative;overflow:hidden}
.gre-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
.gre-hero-glow{position:absolute;top:-80px;right:-80px;width:500px;height:500px;background:radial-gradient(circle,rgba(201,151,58,0.18) 0%,transparent 70%);pointer-events:none}
.gre-hero-content{max-width:1440px;margin:0 auto;padding:64px 64px 0;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:start}
.gre-eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:${T.accent2};text-transform:uppercase;margin-bottom:28px}
.gre-eyebrow::before{content:'';width:32px;height:1px;background:${T.accent2}}
.gre-h1{font-family:'Playfair Display',serif;font-size:clamp(48px,6vw,88px);font-weight:900;line-height:0.9;color:${T.heroText};letter-spacing:-3px}
.gre-h1 .outline{display:block;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,0.2);padding-left:56px;margin-top:4px}
.gre-h1 .sub{display:block;font-family:'Playfair Display',serif;font-weight:400;font-style:italic;font-size:clamp(18px,2.2vw,28px);color:${T.accent};letter-spacing:0;padding-left:112px;margin-top:12px}
.gre-desc{margin-top:28px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:${T.heroMuted};text-transform:uppercase}

/* KPI column */
.gre-kpi-col{display:flex;flex-direction:column;gap:3px;padding-top:72px}
.gre-kpi{background:${T.kpiBg};border:1px solid ${T.kpiBorder};padding:18px 24px;transition:all 0.2s;min-width:160px}
.gre-kpi:hover{background:rgba(255,255,255,0.1);border-color:rgba(201,151,58,0.3)}
.gre-kpi-n{font-family:'Playfair Display',serif;font-size:38px;font-weight:900;line-height:1}
.gre-kpi-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:4px}
.gre-kpi.arrived .gre-kpi-n{color:${T.green}}
.gre-kpi.expected .gre-kpi-n{color:${T.accent2}}
.gre-kpi.pending .gre-kpi-n{color:rgba(255,255,255,0.55)}
.gre-kpi.pct .gre-kpi-n{color:${T.accent}}

/* Progress bar */
.gre-progress-wrap{max-width:1440px;margin:0 auto;padding:28px 64px 0}
.gre-progress-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.gre-progress-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.3);text-transform:uppercase}
.gre-progress-pct{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${T.accent2}}
.gre-progress-bar-bg{height:4px;background:rgba(255,255,255,0.08);overflow:hidden}
.gre-progress-bar-fill{height:100%;background:linear-gradient(90deg,${T.accent},${T.accent2});transition:width 0.8s cubic-bezier(.16,1,.3,1)}

/* Ticker */
.gre-ticker-row{margin-top:32px;border-top:1px solid rgba(255,255,255,0.07);display:flex;overflow:hidden}
.gre-t-badge{background:${T.tickerBadgeBg};color:${T.tickerBadgeText};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;font-weight:500;padding:12px 20px;white-space:nowrap;flex-shrink:0;text-transform:uppercase}
.gre-t-scroll{flex:1;overflow:hidden;display:flex;align-items:center}
.gre-t-track{display:flex;white-space:nowrap;animation:gre-scroll 20s linear infinite}
@keyframes gre-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.gre-t-item{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;color:${T.tickerText};padding:12px 28px;border-right:1px solid rgba(255,255,255,0.05);flex-shrink:0}
.gre-t-item b{color:${T.tickerTextStrong};font-weight:500}

/* ── CONTENT ── */
.gre-content{max-width:1440px;margin:0 auto;padding:56px 64px 120px}
.gre-layout{display:grid;grid-template-columns:1fr 380px;gap:32px;align-items:start}

/* Scan button */
.gre-scan-btn{width:100%;padding:18px 28px;background:${T.accent};color:${T.heroBg};font-family:'DM Mono',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.2s;margin-bottom:20px}
.gre-scan-btn:hover:not(:disabled){background:${T.accent2};transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,151,58,0.35)}
.gre-scan-btn:active:not(:disabled){transform:translateY(0)}
.gre-scan-btn:disabled{opacity:0.5;cursor:not-allowed}
.gre-scan-btn svg{flex-shrink:0}

/* ── INLINE BANNER (replaces toast hook) ── */
.gre-banner{display:flex;align-items:center;gap:10px;padding:13px 18px;margin-bottom:24px;border-left:3px solid;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;animation:gre-fade-in 0.22s ease}
@keyframes gre-fade-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.gre-banner.success{border-color:${T.green};background:rgba(34,197,94,0.07);color:#166534}
.gre-banner.warn{border-color:${T.amber};background:rgba(245,158,11,0.07);color:#92400e}
.gre-banner.error{border-color:${T.red};background:rgba(239,68,68,0.07);color:#991b1b}
.gre-banner.info{border-color:${T.accent};background:rgba(201,151,58,0.07);color:${T.accent}}
.gre-banner-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0}

/* Scanner modal */
.gre-modal-overlay{position:fixed;inset:0;background:rgba(10,31,68,0.88);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;animation:gre-fade-in 0.2s ease}
.gre-modal{background:${T.heroBg};border:1px solid rgba(201,151,58,0.3);width:min(480px,94vw);overflow:hidden;animation:gre-slide-up 0.3s cubic-bezier(.16,1,.3,1)}
@keyframes gre-slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.gre-modal-head{padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between}
.gre-modal-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${T.heroText}}
.gre-modal-close{background:none;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.4);width:32px;height:32px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0}
.gre-modal-close:hover{border-color:rgba(255,255,255,0.3);color:#fff}
.gre-modal-body{padding:28px}
#gre-qr-reader{width:100%!important;border:none!important}
#gre-qr-reader video{border-radius:0!important}
#gre-qr-reader *{font-family:'DM Mono',monospace!important;font-size:10px!important}
.gre-scanner-hint{margin-top:14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${T.accent2};text-align:center;animation:gre-pulse 1.8s ease-in-out infinite}
@keyframes gre-pulse{0%,100%{opacity:1}50%{opacity:0.4}}

/* Guest list */
.gre-list-head{display:flex;align-items:flex-end;gap:0;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid ${T.border};position:relative}
.gre-list-head::after{content:'';position:absolute;bottom:-1px;left:0;width:72px;height:2px;background:${T.primary}}
.gre-list-num{font-family:'Playfair Display',serif;font-size:80px;font-weight:900;line-height:1;color:rgba(10,31,68,0.06);letter-spacing:-5px;margin-right:-8px;user-select:none;flex-shrink:0}
.gre-list-meta{padding-bottom:8px}
.gre-list-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:${T.primary};letter-spacing:-0.5px;line-height:1}
.gre-list-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:${T.muted};text-transform:uppercase;margin-top:6px}

/* Search */
.gre-search{width:100%;padding:14px 18px;background:${T.cardBg};border:1.5px solid ${T.border};font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;color:${T.primary};outline:none;margin-bottom:20px;transition:border-color 0.2s}
.gre-search:focus{border-color:${T.primary}}
.gre-search::placeholder{color:${T.mutedLight}}

/* Filter tabs */
.gre-filters{display:flex;gap:6px;margin-bottom:24px;flex-wrap:wrap}
.gre-filter-btn{padding:0 14px;height:28px;border:1.5px solid ${T.border};background:transparent;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${T.mutedLight};cursor:pointer;transition:all 0.15s}
.gre-filter-btn.on{background:${T.primary};color:#fff;border-color:${T.primary}}
.gre-filter-btn:hover:not(.on){border-color:${T.primary};color:${T.primary}}

/* Guest rows */
.gre-guest-row{background:${T.cardBg};border:1.5px solid ${T.border};padding:18px 20px;display:flex;align-items:center;gap:16px;transition:all 0.25s cubic-bezier(.16,1,.3,1);animation:gre-rise 0.4s ease both;position:relative;overflow:hidden;margin-bottom:8px}
@keyframes gre-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.gre-guest-row::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px}
.gre-guest-row.arrived::before{background:${T.green}}
.gre-guest-row.invited::before{background:${T.border}}
.gre-guest-row.new-scan{animation:gre-flash 1.4s ease}
@keyframes gre-flash{0%{background:rgba(34,197,94,0.14);border-color:rgba(34,197,94,0.55)}100%{background:${T.cardBg};border-color:${T.border}}}
.gre-guest-row:hover{border-color:${T.borderStrong};transform:translateX(3px)}
.gre-guest-avatar{width:40px;height:40px;border-radius:50%;background:${T.primary};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:${T.accent2};flex-shrink:0}
.gre-guest-info{flex:1;min-width:0}
.gre-guest-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:${T.primary};line-height:1.2}
.gre-guest-email{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:${T.muted};margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gre-guest-time{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:${T.mutedLight};margin-top:3px}
.gre-guest-badge{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;font-weight:500;padding:4px 10px;text-transform:uppercase;border:1px solid;flex-shrink:0}
.gre-guest-badge.arrived{color:${T.green};background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.25)}
.gre-guest-badge.invited{color:${T.mutedLight};background:transparent;border-color:${T.border}}
.gre-empty{text-align:center;padding:80px 0;font-family:'Playfair Display',serif;font-size:22px;font-style:italic;color:rgba(10,31,68,0.18)}

/* Skeleton */
.gre-skeleton{background:linear-gradient(90deg,rgba(10,31,68,0.05) 25%,rgba(10,31,68,0.1) 50%,rgba(10,31,68,0.05) 75%);background-size:200% 100%;animation:gre-shimmer 1.4s ease infinite;height:72px;margin-bottom:8px}
@keyframes gre-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}

/* Sidebar */
.gre-sidebar-card{background:${T.cardBg};border:1.5px solid ${T.border};padding:24px;margin-bottom:16px}
.gre-sidebar-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${T.muted};margin-bottom:16px;display:flex;align-items:center;gap:8px}
.gre-sidebar-title::after{content:'';flex:1;height:1px;background:${T.border}}

/* Last scanned */
.gre-last-guest{padding:20px;background:${T.heroBg};border:1px solid rgba(201,151,58,0.3);animation:gre-fade-in 0.3s ease}
.gre-last-name{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:${T.heroText};margin-bottom:4px}
.gre-last-email{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.35);margin-bottom:14px}
.gre-last-status{display:inline-flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:6px 12px;border:1px solid}
.gre-last-status.arrived{color:${T.green};border-color:rgba(34,197,94,0.4);background:rgba(34,197,94,0.1)}
.gre-last-status.already{color:${T.amber};border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.08)}
.gre-last-status .dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.gre-last-phone{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.25);margin-top:10px}

/* Donut */
.gre-donut-wrap{display:flex;align-items:center;gap:20px}
.gre-donut{flex-shrink:0}
.gre-donut-legend{display:flex;flex-direction:column;gap:10px}
.gre-legend-item{display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${T.muted}}
.gre-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.gre-legend-val{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:${T.primary};line-height:1;display:block;margin-top:2px}

/* Scheme tag */
.gre-scheme-tag{position:fixed;top:16px;right:16px;z-index:200;background:${T.accent};color:${T.heroBg};font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;padding:6px 12px;text-transform:uppercase;pointer-events:none}

@media(max-width:900px){
  .gre-hero-content,.gre-progress-wrap,.gre-content{padding-left:24px;padding-right:24px}
  .gre-hero-content{grid-template-columns:1fr}
  .gre-kpi-col{padding-top:24px;flex-direction:row;flex-wrap:wrap;gap:8px}
  .gre-layout{grid-template-columns:1fr}
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────
const api = axiosInstance; // pre-configured with baseURL and interceptors for auth

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useAnimNum(val) {
    const [d, setD] = useState(val);
    const prev = useRef(val);
    useEffect(() => {
        const s = prev.current, e = val;
        if (s === e) return;
        const dur = 600, t0 = performance.now();
        const tick = (t) => {
            const prog = Math.min((t - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - prog, 4);
            setD(Math.round(s + (e - s) * ease));
            if (prog < 1) requestAnimationFrame(tick);
            else prev.current = e;
        };
        requestAnimationFrame(tick);
    }, [val]);
    return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART — pure SVG, zero dependencies
// ─────────────────────────────────────────────────────────────────────────────
function Donut({ arrived, expected }) {
    const r = 52, cx = 64, cy = 64;
    const circumference = 2 * Math.PI * r;
    const pct = expected > 0 ? Math.min(arrived / expected, 1) : 0;
    const dash = pct * circumference;
    return (
        <svg width={128} height={128} className="gre-donut" viewBox="0 0 128 128">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={10} />
            <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={T.accent2} strokeWidth={10}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.16,1,.3,1)' }}
            />
            <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="Playfair Display,serif"
                fontSize={22} fontWeight={900} fill={T.accent2}>
                {Math.round(pct * 100)}%
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="DM Mono,monospace"
                fontSize={8} letterSpacing={2} fill="rgba(10,31,68,0.35)"
                style={{ textTransform: 'uppercase' }}>
                arrived
            </text>
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const GuestEntry = ({ }) => {
    const { id } = useParams();
	console.log(id);
    const eventId = id; // for clarity in API calls and state
    const [guests, setGuests]                 = useState([]);
    const [loading, setLoading]               = useState(true);
    const [scannerOpen, setScannerOpen]       = useState(false);
    const [lastScanned, setLastScanned]       = useState(null);
    const [lastScanResult, setLastScanResult] = useState(null); // 'arrived' | 'already'
    const [filter, setFilter]                 = useState('ALL');
    const [search, setSearch]                 = useState('');
    const [newScanId, setNewScanId]           = useState(null);
    const [scanning, setScanning]             = useState(false);
    const [banner, setBanner]                 = useState(null); // { msg, type }

    const html5QrRef  = useRef(null);
    const bannerTimer = useRef(null);

    // ── Stats derived from guest list ────────────────────────────────────────
    const expected = guests.length;
    const arrived  = guests.filter(g => g.rsvpStatus === 'ARRIVED').length;
    const pending  = guests.filter(g => g.rsvpStatus === 'INVITED').length;
    const pct      = expected > 0 ? Math.round((arrived / expected) * 100) : 0;

    const animExpected = useAnimNum(expected);
    const animArrived  = useAnimNum(arrived);
    const animPending  = useAnimNum(pending);

    // ── Inline banner (auto-dismisses after 4 s) ─────────────────────────────
    const showBanner = useCallback((msg, type = 'success') => {
        if (bannerTimer.current) clearTimeout(bannerTimer.current);
        setBanner({ msg, type });
        bannerTimer.current = setTimeout(() => setBanner(null), 4000);
    }, []);

    // ── Fetch guests by eventId ──────────────────────────────────────────────
    useEffect(() => {
        if (!eventId) {
            showBanner('No eventId prop provided', 'error');
            setLoading(false);
            return;
        }
        setLoading(true);
        console.log('Fetching guests for eventId:', eventId);
        api.get(`/guests?eventId=${eventId}`)
            .then(res => setGuests(res.data.data))
            .catch(err => {
                const msg = err.response?.data?.message ?? 'Failed to load guest list';
                showBanner(msg, 'error');
            })
            .finally(() => setLoading(false));
    }, [eventId]);

    // ── QR scanner lifecycle ─────────────────────────────────────────────────
    useEffect(() => {
        if (!scannerOpen) return;

        const startScanner = () => {
            try {
                const qr = new window.Html5Qrcode('gre-qr-reader');
                html5QrRef.current = qr;
                qr.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 260, height: 260 } },
                    handleQrResult,
                    () => { /* suppress per-frame decode errors */ }
                ).catch(err => {
                    console.error(err);
                    showBanner('Camera access denied — check permissions', 'error');
                    setScannerOpen(false);
                });
            } catch (err) {
                console.error(err);
                showBanner('QR scanner could not start', 'error');
                setScannerOpen(false);
            }
        };

        if (window.Html5Qrcode) {
            startScanner();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
            script.onload  = startScanner;
            script.onerror = () => {
                showBanner('Failed to load QR scanner library', 'error');
                setScannerOpen(false);
            };
            document.head.appendChild(script);
        }

        return () => {
            html5QrRef.current?.stop().catch(() => { });
            html5QrRef.current = null;
        };
    }, [scannerOpen]);

    // ── QR scan handler ──────────────────────────────────────────────────────
    const handleQrResult = useCallback(async (rawText) => {
        if (scanning) return; // guard against multiple frames
        setScanning(true);

        // Stop camera immediately
        html5QrRef.current?.stop().catch(() => { });
        html5QrRef.current = null;
        setScannerOpen(false);

        // 1 — Parse QR JSON
        let payload;
        try {
            payload = JSON.parse(rawText);
        } catch {
            showBanner('Invalid QR — not a JSON payload', 'error');
            setScanning(false);
            return;
        }

        const { iv, data } = payload;
        if (!iv || !data) {
            showBanner("QR payload missing 'iv' or 'data'", 'error');
            setScanning(false);
            return;
        }

        // 2 — Decrypt via server: POST /api/dr/decrypt-data
        //     Response shape: { message: string, originalData: GuestObject }
        let guestData;
        try {
            const { data: decryptRes } = await api.post('/dr/decrypt-data', { iv, data });
            guestData = decryptRes.originalData;
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Decryption failed';
            showBanner(msg, 'error');
            setScanning(false);
            return;
        }

        if (!guestData?._id) {
            showBanner('Decrypted data missing guest _id', 'error');
            setScanning(false);
            return;
        }

        // 3 — Already checked in?
        if (guestData.rsvpStatus === 'ARRIVED') {
            setLastScanned(guestData);
            setLastScanResult('already');
            showBanner(`${guestData.name} has already checked in`, 'warn');
            setScanning(false);
            return;
        }

        // 4 — Mark ARRIVED: PATCH /api/guests/:id/arrive
        //     Backend does: Guest.findOne({ _id }) then updates rsvpStatus + rsvpConfirmedAt
        try {
            const { data: updatedGuest } = await api.patch(`/guests/${guestData._id}/arrive`);

            setLastScanned(updatedGuest);
            setLastScanResult('arrived');
            setNewScanId(updatedGuest._id);
            setTimeout(() => setNewScanId(null), 1500);

            // Reflect change locally — avoids a full re-fetch
            setGuests(prev => {
                const exists = prev.some(g => g._id === updatedGuest._id);
                return exists
                    ? prev.map(g => g._id === updatedGuest._id ? updatedGuest : g)
                    : [updatedGuest, ...prev]; // newly-added guest (edge case)
            });

            showBanner(`✓ ${updatedGuest.name} checked in`, 'success');
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Failed to update guest status';
            showBanner(msg, 'error');
        }

        setScanning(false);
    }, [scanning, showBanner]);

    // ── Filtered guest list ──────────────────────────────────────────────────
    const filteredGuests = guests.filter(g => {
        const matchStatus = filter === 'ALL' || g.rsvpStatus === filter;
        const q = search.toLowerCase();
        const matchSearch = !q
            || g.name?.toLowerCase().includes(q)
            || g.email?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const arrivedGuests = guests.filter(g => g.rsvpStatus === 'ARRIVED');
    const tickerPool    = arrivedGuests.length > 0 ? arrivedGuests : guests;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{buildCSS()}</style>
            <div className="gre-app">
                <div className="gre-scheme-tag">Navy & Ivory</div>

                {/* ── HERO ── */}
                <div className="gre-hero">
                    <div className="gre-hero-grid" />
                    <div className="gre-hero-glow" />

                    <div className="gre-hero-content">
                        <div>
                            <div className="gre-eyebrow">Hackniche Hospitality · 2025</div>
                            <h1 className="gre-h1">
                                Guest
                                <span className="outline">Entry</span>
                                <span className="sub">Live Check-In Dashboard</span>
                            </h1>
                            <p className="gre-desc">
                                Real-time arrival tracking · QR check-in · AES-256 encrypted
                            </p>
                        </div>

                        <div className="gre-kpi-col">
                            {[
                                { n: animExpected, l: 'Expected',   cls: 'expected' },
                                { n: animArrived,  l: 'Arrived',    cls: 'arrived'  },
                                { n: animPending,  l: 'Pending',    cls: 'pending'  },
                                { n: pct + '%',    l: 'Attendance', cls: 'pct'      },
                            ].map(k => (
                                <div className={`gre-kpi ${k.cls}`} key={k.l}>
                                    <div className="gre-kpi-n">{k.n}</div>
                                    <div className="gre-kpi-l">{k.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="gre-progress-wrap">
                        <div className="gre-progress-label">
                            <span className="gre-progress-title">Arrival Progress</span>
                            <span className="gre-progress-pct">{pct}%</span>
                        </div>
                        <div className="gre-progress-bar-bg">
                            <div className="gre-progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    {/* Ticker */}
                    {tickerPool.length > 0 && (
                        <div className="gre-ticker-row">
                            <div className="gre-t-badge">Recently Arrived</div>
                            <div className="gre-t-scroll">
                                <div className="gre-t-track">
                                    {[...tickerPool, ...tickerPool].map((g, i) => (
                                        <div className="gre-t-item" key={i}>
                                            <b>{g.name}</b> — {g.rsvpStatus === 'ARRIVED' ? '✓ Checked In' : 'Awaited'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="gre-content">

                    {/* Scan CTA */}
                    <button
                        className="gre-scan-btn"
                        onClick={() => setScannerOpen(true)}
                        disabled={scanning}
                    >
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={2.5} strokeLinecap="square">
                            <rect x={3} y={3} width={7} height={7} />
                            <rect x={14} y={3} width={7} height={7} />
                            <rect x={3} y={14} width={7} height={7} />
                            <path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3z" />
                        </svg>
                        {scanning ? 'Processing…' : 'Scan QR Code — Check In Guest'}
                    </button>

                    {/* Inline status banner */}
                    {banner && (
                        <div className={`gre-banner ${banner.type}`}>
                            <span className="gre-banner-dot" />
                            {banner.msg}
                        </div>
                    )}

                    <div className="gre-layout">

                        {/* ── LEFT: GUEST LIST ── */}
                        <div>
                            <div className="gre-list-head">
                                <div className="gre-list-num">
                                    {String(filteredGuests.length).padStart(2, '0')}
                                </div>
                                <div className="gre-list-meta">
                                    <div className="gre-list-title">Guest List</div>
                                    <div className="gre-list-tag">
                                        {loading
                                            ? 'Loading…'
                                            : `${filteredGuests.length} of ${guests.length} guests shown`}
                                    </div>
                                </div>
                            </div>

                            <input
                                className="gre-search"
                                placeholder="Search by name or email…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />

                            <div className="gre-filters">
                                {['ALL', 'ARRIVED', 'INVITED'].map(f => (
                                    <button
                                        key={f}
                                        className={`gre-filter-btn ${filter === f ? 'on' : ''}`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f === 'ALL'
                                            ? `All (${guests.length})`
                                            : f === 'ARRIVED'
                                                ? `Arrived (${arrived})`
                                                : `Pending (${pending})`}
                                    </button>
                                ))}
                            </div>

                            {/* Skeleton while loading */}
                            {loading && [1, 2, 3, 4].map(i => (
                                <div className="gre-skeleton" key={i} />
                            ))}

                            {!loading && filteredGuests.length === 0 && (
                                <div className="gre-empty">No guests match the filter.</div>
                            )}

                            {!loading && filteredGuests.map((g, idx) => {
                                const initials = g.name
                                    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?';
                                const status = g.rsvpStatus?.toLowerCase() ?? 'invited';
                                const isNew  = g._id === newScanId;
                                return (
                                    <div
                                        key={g._id}
                                        className={`gre-guest-row ${status}${isNew ? ' new-scan' : ''}`}
                                        style={{ animationDelay: `${idx * 28}ms` }}
                                    >
                                        <div className="gre-guest-avatar">{initials}</div>
                                        <div className="gre-guest-info">
                                            <div className="gre-guest-name">{g.name}</div>
                                            <div className="gre-guest-email">{g.email}</div>
                                            {g.rsvpStatus === 'ARRIVED' && g.rsvpConfirmedAt && (
                                                <div className="gre-guest-time">
                                                    ✓&nbsp;
                                                    {new Date(g.rsvpConfirmedAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`gre-guest-badge ${status}`}>
                                            {g.rsvpStatus === 'ARRIVED' ? '✓ Arrived' : 'Invited'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── RIGHT: SIDEBAR ── */}
                        <div>
                            {/* Attendance donut */}
                            <div className="gre-sidebar-card">
                                <div className="gre-sidebar-title">Attendance</div>
                                <div className="gre-donut-wrap">
                                    <Donut arrived={arrived} expected={expected} />
                                    <div className="gre-donut-legend">
                                        {[
                                            { color: T.accent2, label: 'Expected', val: expected },
                                            { color: T.green,   label: 'Arrived',  val: arrived  },
                                            { color: T.border,  label: 'Pending',  val: pending  },
                                        ].map(l => (
                                            <div className="gre-legend-item" key={l.label}>
                                                <span className="gre-legend-dot" style={{ background: l.color }} />
                                                <div>
                                                    {l.label}
                                                    <span className="gre-legend-val">{l.val}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Last scanned guest */}
                            {lastScanned && (
                                <div className="gre-sidebar-card">
                                    <div className="gre-sidebar-title">Last Scanned</div>
                                    <div className="gre-last-guest">
                                        <div className="gre-last-name">{lastScanned.name}</div>
                                        <div className="gre-last-email">{lastScanned.email}</div>
                                        <span className={`gre-last-status ${lastScanResult}`}>
                                            <span className="dot" />
                                            {lastScanResult === 'arrived' ? 'Checked In' : 'Already Arrived'}
                                        </span>
                                        {lastScanned.phone && (
                                            <div className="gre-last-phone">{lastScanned.phone}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* How it works */}
                            <div className="gre-sidebar-card">
                                <div className="gre-sidebar-title">How It Works</div>
                                {[
                                    ['01', 'Tap "Scan QR Code" to open camera'],
                                    ['02', 'Point at the guest\'s QR code'],
                                    ['03', 'POST /api/dr/decrypt-data returns originalData'],
                                    ['04', 'PATCH /api/guests/:id/arrive updates rsvpStatus'],
                                ].map(([n, text]) => (
                                    <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                        <span style={{
                                            fontFamily: 'DM Mono,monospace', fontSize: 9,
                                            letterSpacing: 3, color: T.accent, flexShrink: 0, paddingTop: 2,
                                        }}>{n}</span>
                                        <span style={{
                                            fontFamily: 'DM Mono,monospace', fontSize: 10,
                                            letterSpacing: 1, color: T.muted, lineHeight: 1.5,
                                        }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── QR SCANNER MODAL ── */}
                {scannerOpen && (
                    <div
                        className="gre-modal-overlay"
                        onClick={e => e.target === e.currentTarget && setScannerOpen(false)}
                    >
                        <div className="gre-modal">
                            <div className="gre-modal-head">
                                <span className="gre-modal-title">Scan Guest QR</span>
                                <button className="gre-modal-close" onClick={() => setScannerOpen(false)}>✕</button>
                            </div>
                            <div className="gre-modal-body">
                                <div id="gre-qr-reader" />
                                <div className="gre-scanner-hint">● Scanning for QR code…</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GuestEntry;
