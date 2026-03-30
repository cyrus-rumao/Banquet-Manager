import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── THEME ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body,#root{background:#E8E4DC;margin:0}

/* ── NAV ───────────────────────────────────────────────── */
.hp-nav{position:fixed;top:0;left:0;right:0;z-index:100;transition:all 0.35s}
.hp-nav.scrolled{background:rgba(10,31,68,0.96);backdrop-filter:blur(20px);box-shadow:0 2px 32px rgba(0,0,0,0.3)}
.hp-nav.top{background:transparent}
.hp-nav-inner{max-width:1400px;margin:0 auto;padding:0 64px;height:72px;display:flex;align-items:center;justify-content:space-between}
.hp-logo{display:flex;align-items:center;gap:12px;text-decoration:none;cursor:pointer}
.hp-logo-mark{width:36px;height:36px;background:#C9973A;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:#0A1F44;letter-spacing:-1px;flex-shrink:0}
.hp-logo-text{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.5px}
.hp-logo-text span{color:#E8B84B}
.hp-links{display:flex;align-items:center;gap:0}
.hp-link{padding:0 20px;height:72px;display:flex;align-items:center;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:500;color:rgba(255,255,255,0.6);cursor:pointer;border:none;background:none;transition:color 0.18s;text-decoration:none}
.hp-link:hover{color:#fff}
.hp-link.active{color:#E8B84B}
.hp-cta{height:38px;padding:0 22px;background:#C9973A;color:#0A1F44;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;transition:all 0.18s}
.hp-cta:hover{background:#E8B84B;transform:translateY(-1px)}

/* ── HERO ───────────────────────────────────────────────── */
.hp-hero{background:#0A1F44;min-height:100vh;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.hp-hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:72px 72px}
.hp-glow1{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.16) 0%,transparent 65%);top:-350px;right:-200px;pointer-events:none}
.hp-glow2{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(41,82,163,0.3) 0%,transparent 65%);bottom:-150px;left:5%;pointer-events:none}
.hp-glow3{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.1) 0%,transparent 65%);bottom:20%;right:15%;pointer-events:none}
.hp-hero-inner{position:relative;z-index:2;max-width:1400px;margin:0 auto;padding:0 64px;width:100%}
.hp-eyebrow{display:inline-flex;align-items:center;gap:14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:#E8B84B;text-transform:uppercase;margin-bottom:32px;animation:hpfade 0.8s ease 0.1s both}
.hp-eyebrow::before{content:'';width:40px;height:1px;background:#E8B84B}
.hp-h1{font-family:'Playfair Display',serif;font-size:clamp(56px,8vw,112px);font-weight:900;line-height:0.88;color:#fff;letter-spacing:-4px;animation:hpfade 0.8s ease 0.2s both}
.hp-h1 .ol{display:block;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,0.2);padding-left:72px;margin-top:8px}
.hp-h1 .gold{color:#E8B84B}
.hp-tagline{font-family:'Playfair Display',serif;font-weight:400;font-style:italic;font-size:clamp(18px,2.5vw,30px);color:#C9973A;display:block;padding-left:140px;margin-top:16px}
.hp-sub{margin-top:40px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.5);max-width:560px;font-family:'DM Sans',sans-serif;animation:hpfade 0.8s ease 0.4s both}
.hp-btns{display:flex;align-items:center;gap:16px;margin-top:40px;animation:hpfade 0.8s ease 0.55s both}
.hp-btn-prim{height:52px;padding:0 36px;background:#C9973A;color:#0A1F44;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:500;border:none;cursor:pointer;transition:all 0.22s}
.hp-btn-prim:hover{background:#E8B84B;transform:translateY(-2px);box-shadow:0 12px 36px rgba(201,151,58,0.35)}
.hp-btn-sec{height:52px;padding:0 36px;background:transparent;color:rgba(255,255,255,0.65);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;border:1.5px solid rgba(255,255,255,0.2);cursor:pointer;transition:all 0.22s}
.hp-btn-sec:hover{border-color:rgba(255,255,255,0.5);color:#fff}
.hp-scroll-hint{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;animation:hpfade 1.2s ease 1s both;cursor:pointer}
.hp-scroll-dot{width:1px;height:60px;background:linear-gradient(to bottom,transparent,rgba(201,151,58,0.7));animation:scrolldot 2s ease-in-out infinite}
@keyframes scrolldot{0%,100%{transform:scaleY(0.4);opacity:0.4}50%{transform:scaleY(1);opacity:1}}
.hp-scroll-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25)}
.hp-hero-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:80px;position:relative;z-index:2;animation:hpfade 0.8s ease 0.7s both}
.hp-hc{background:rgba(255,255,255,0.04);border-top:1px solid rgba(255,255,255,0.07);padding:28px 30px}
.hp-hc-n{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:#E8B84B;line-height:1}
.hp-hc-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:6px}
@keyframes hpfade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

/* ── FEATURES ───────────────────────────────────────────── */
.hp-sec{max-width:1400px;margin:0 auto;padding:112px 64px}
.hp-sec-ey{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;color:#C9973A;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:12px}
.hp-sec-ey::before{content:'';width:32px;height:1px;background:#C9973A}
.hp-sec-h2{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);font-weight:900;color:#0A1F44;letter-spacing:-2px;line-height:1;margin-bottom:16px}
.hp-sec-h2 em{font-style:italic;color:#C9973A}
.hp-sec-sub{font-size:14px;color:#5A6A8A;line-height:1.7;max-width:480px;font-family:'DM Sans',sans-serif}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:56px}
.feat-card{background:#F5F1E8;border:1.5px solid rgba(10,31,68,0.1);padding:36px 30px 32px;position:relative;overflow:hidden;transition:all 0.3s cubic-bezier(.16,1,.3,1)}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 20px 56px rgba(10,31,68,0.1);border-color:rgba(10,31,68,0.25)}
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0A1F44,#2952A3);transform:scaleX(0);transform-origin:left;transition:transform 0.3s}
.feat-card:hover::before{transform:scaleX(1)}
.feat-icon{width:48px;height:48px;background:#0A1F44;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:22px;flex-shrink:0}
.feat-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#0A1F44;margin-bottom:10px;letter-spacing:-0.3px}
.feat-desc{font-size:13px;color:#5A6A8A;line-height:1.65;font-family:'DM Sans',sans-serif}
.feat-tag{margin-top:20px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;color:#C9973A;text-transform:uppercase}

/* ── ABOUT ──────────────────────────────────────────────── */
.hp-about{background:#0A1F44;position:relative;overflow:hidden}
.hp-about-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:60px 60px}
.about-inner{max-width:1400px;margin:0 auto;padding:112px 64px;position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.about-left .hp-sec-h2{color:#fff}.about-left .hp-sec-sub{color:rgba(255,255,255,0.5)}
.about-values{margin-top:36px;display:flex;flex-direction:column;gap:16px}
.av{display:flex;align-items:flex-start;gap:14px}
.av-dot{width:8px;height:8px;background:#C9973A;flex-shrink:0;margin-top:5px}
.av-text{font-size:13.5px;color:rgba(255,255,255,0.65);line-height:1.6;font-family:'DM Sans',sans-serif}
.av-text strong{color:#E8B84B;font-weight:600}
.about-right{display:grid;grid-template-columns:1fr 1fr;gap:3px}
.astat{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:28px 24px;transition:.2s}
.astat:hover{background:rgba(255,255,255,0.09);border-color:rgba(201,151,58,0.3)}
.astat-n{font-family:'Playfair Display',serif;font-size:42px;font-weight:900;color:#E8B84B;line-height:1}
.astat-l{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2.5px;color:rgba(255,255,255,0.28);text-transform:uppercase;margin-top:6px}

/* ── TESTIMONIAL / CTA ──────────────────────────────────── */
.hp-cta-sec{background:#E8E4DC;padding:112px 64px;text-align:center}
.hp-cta-sec .hp-sec-ey{justify-content:center}
.hp-cta-sec .hp-sec-ey::before{display:none}
.hp-cta-sec .hp-sec-h2{max-width:600px;margin:0 auto 16px}
.hp-cta-sec .hp-sec-sub{margin:0 auto 40px;text-align:center}
.hp-cta-btns{display:flex;align-items:center;justify-content:center;gap:16px}

/* ── FOOTER ─────────────────────────────────────────────── */
.hp-footer{background:#05132B;color:#fff}
.hp-footer-top{max-width:1400px;margin:0 auto;padding:72px 64px 56px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
.hf-brand .hp-logo{margin-bottom:20px;display:inline-flex}
.hf-brand-desc{font-size:13px;color:rgba(255,255,255,0.38);line-height:1.7;max-width:280px;font-family:'DM Sans',sans-serif}
.hf-brand-badge{display:inline-flex;align-items:center;gap:8px;margin-top:24px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.25)}
.hf-brand-badge::before{content:'';width:20px;height:1px;background:rgba(255,255,255,0.2)}
.hf-col-title{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:18px}
.hf-links{display:flex;flex-direction:column;gap:10px}
.hf-link{font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;border:none;background:none;text-align:left;font-family:'DM Sans',sans-serif;padding:0;transition:color 0.15s}
.hf-link:hover{color:#E8B84B}
.hp-footer-bottom{border-top:1px solid rgba(255,255,255,0.06);max-width:1400px;margin:0 auto;padding:24px 64px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.hf-copy{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,0.2);text-transform:uppercase}
.hf-social{display:flex;gap:12px}
.hf-soc-btn{width:32px;height:32px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all 0.15s}
.hf-soc-btn:hover{border-color:rgba(201,151,58,0.5);color:#E8B84B;background:rgba(201,151,58,0.08)}

/* ── DIVIDERS ────────────────────────────────────────────── */
.hp-divider{height:2px;background:linear-gradient(90deg,transparent,rgba(10,31,68,0.12) 20%,rgba(10,31,68,0.12) 80%,transparent)}

@media(max-width:960px){.hp-nav-inner,.hp-hero-inner,.hp-sec,.about-inner,.hp-cta-sec,.hp-footer-top,.hp-footer-bottom{padding-left:24px;padding-right:24px}.hp-h1 .ol{padding-left:32px}.hp-tagline{padding-left:60px}.feat-grid,.about-inner,.hp-footer-top{grid-template-columns:1fr}.hp-hero-cards{grid-template-columns:1fr 1fr}.hp-links .hp-link{display:none}.about-right{grid-template-columns:1fr 1fr}}
`;

const FEATURES = [
	{
		icon: '◈',
		title: 'Event Lifecycle Management',
		desc: 'Track every event from initial enquiry through booking, execution, and post-event settlement — with real-time status updates and role-based actions.',
		tag: 'Sales · Finance · Admin',
	},
	{
		icon: '₹',
		title: 'Payments & Financial Tracking',
		desc: 'Log deposits, partial payments, and final settlements. Auto-calculate balances with full GST support and financial snapshots at every stage.',
		tag: 'Finance · RTGS · NEFT · UPI',
	},
	{
		icon: '◉',
		title: 'Guest & Headcount Control',
		desc: 'Manage expected and arrived headcounts with Jain-specific flags, bulk CSV imports, and live QR-based check-in for on-the-day precision.',
		tag: 'GRE · Front Desk · Kitchen',
	},
	{
		icon: '▶',
		title: 'Audit Trail & Compliance',
		desc: 'Every action is logged — who did it, when, what changed, and why. Immutable audit records with before/after diffs for full accountability.',
		tag: 'Admin · Audit · Compliance',
	},
	{
		icon: '◆',
		title: 'Menu & Catering Intelligence',
		desc: 'Assign tiered menus to events, optimise per-head costs, and get AI-recommended packages based on event type and historical popularity.',
		tag: 'Kitchen · Procurement',
	},
	{
		icon: '✦',
		title: 'Post-Event Analytics',
		desc: 'Turn raw event data into actionable insights — pipeline health, revenue forecasts, operational synergy opportunities, and manager workload analysis.',
		tag: 'Management · Strategy',
	},
];

const STATS = [
	{ n: '500+', l: 'Events Managed' },
	{ n: '2L+', l: 'Guests Served' },
	{ n: '₹18Cr', l: 'Revenue Processed' },
	{ n: '99.2%', l: 'On-Time Delivery' },
];

export default function HomePage() {
	const user = JSON.parse(localStorage.getItem('user'));
	const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const scrollTo = (id) =>
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

	return (
		<>
			<style>{CSS}</style>

			{/* ── NAVBAR ───────────────────────────────────────────── */}
			<nav className={`hp-nav ${scrolled ? 'scrolled' : 'top'}`}>
				<div className="hp-nav-inner">
					<div
						className="hp-logo"
						onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
						<div className="hp-logo-mark">B</div>
						<div className="hp-logo-text">
							Banquet<span>Pro</span>
						</div>
					</div>
					<div className="hp-links">
						<button
							className="hp-link active"
							onClick={() => scrollTo('hero')}>
							Home
						</button>
						<button
							className="hp-link"
							onClick={() => scrollTo('about')}>
							About Us
						</button>
						{!user && (
							<button
								className="hp-cta"
								onClick={() => navigate('/login')}>
								Login →
							</button>
						)}
						{!user && (
							<button
								className="hp-cta"
								onClick={() => navigate('/register')}>
								Reegister →
							</button>
						)}
						{user && (
							<button
								className="hp-cta"
								onClick={() => navigate('/dashboard')}>
								Dashboard
							</button>
						)}
						{user && (
							<button
								className="hp-link"
								onClick={() => {
									localStorage.removeItem('user');
									navigate('/login');
								}}>
								Logout
							</button>
						)}
					</div>
				</div>
			</nav>

			{/* ── HERO ─────────────────────────────────────────────── */}
			<section
				id="hero"
				className="hp-hero">
				<div className="hp-hero-grid" />
				<div className="hp-glow1" />
				<div className="hp-glow2" />
				<div className="hp-glow3" />
				<div className="hp-hero-inner">
					<div className="hp-eyebrow">Hackniche Hospitality · Est. 2024</div>
					<h1 className="hp-h1">
						Banquet
						<span className="ol">Pro</span>
						<span className="tagline hp-tagline">
							Event Operations, Reimagined
						</span>
					</h1>
					<p className="hp-sub">
						The complete operational platform for Indian banquet halls and
						hospitality venues. From first enquiry to final settlement — every
						detail, every guest, every rupee.
					</p>
					<div className="hp-btns">
						<button
							className="hp-btn-prim"
							onClick={() => navigate('/dashboard')}>
							Go to Dashboard
						</button>
						<button
							className="hp-btn-sec"
							onClick={() => scrollTo('features')}>
							Explore Features
						</button>
					</div>
				</div>
				<div className="hp-hero-cards">
					{STATS.map((s) => (
						<div
							className="hp-hc"
							key={s.l}>
							<div className="hp-hc-n">{s.n}</div>
							<div className="hp-hc-l">{s.l}</div>
						</div>
					))}
					<div
						className="hp-hc"
						style={{
							background: 'rgba(201,151,58,0.12)',
							borderTopColor: 'rgba(201,151,58,0.3)',
						}}>
						<div
							className="hp-hc-n"
							style={{ fontSize: 28, marginTop: 8 }}>
							Navy & Ivory
						</div>
						<div className="hp-hc-l">Refined Hospitality Platform</div>
					</div>
				</div>
				<div
					className="hp-scroll-hint"
					onClick={() => scrollTo('features')}>
					<div className="hp-scroll-dot" />
					<span className="hp-scroll-lbl">Scroll</span>
				</div>
			</section>

			{/* ── FEATURES ─────────────────────────────────────────── */}
			<section
				id="features"
				style={{ background: '#E8E4DC' }}>
				<div className="hp-sec">
					<div className="hp-sec-ey">Platform Capabilities</div>
					<h2 className="hp-sec-h2">
						Everything your banquet
						<br />
						operation <em>needs</em>
					</h2>
					<p className="hp-sec-sub">
						Built specifically for Indian hospitality — GST-ready, multi-role,
						and designed for the complexity of large-scale event management.
					</p>
					<div className="feat-grid">
						{FEATURES.map((f, i) => (
							<div
								className="feat-card"
								key={f.title}
								style={{ animationDelay: `${i * 60}ms` }}>
								<div className="feat-icon">{f.icon}</div>
								<div className="feat-title">{f.title}</div>
								<div className="feat-desc">{f.desc}</div>
								<div className="feat-tag">{f.tag}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<div className="hp-divider" />

			{/* ── ABOUT ────────────────────────────────────────────── */}
			<section
				id="about"
				className="hp-about">
				<div className="hp-about-grid" />
				<div className="about-inner">
					<div className="about-left">
						<div
							className="hp-sec-ey"
							style={{ color: '#E8B84B' }}>
							Our Story
						</div>
						<h2 className="hp-sec-h2">
							Built by operators,
							<br />
							for <em>operators</em>
						</h2>
						<p className="hp-sec-sub">
							We started as a Mumbai banquet hall trying to manage 500-guest
							weddings on spreadsheets. Three years and a hundred events later,
							BanquetPro is the system we wished we had.
						</p>
						<div className="about-values">
							{[
								[
									'Precision over paper',
									'Every payment, every note, every status transition — digitised, timestamped, and auditable.',
								],
								[
									'Built for Indian scale',
									'Jain counters, GST splits, NEFT/UPI/Cheque — we speak the language of Indian hospitality operations.',
								],
								[
									'Role-aware workflows',
									'Sales, Finance, GRE, and Admin each see exactly what they need — nothing more, nothing less.',
								],
								[
									'Zero black boxes',
									'Full audit trail means you always know who did what, when, and why.',
								],
							].map(([t, d]) => (
								<div
									className="av"
									key={t}>
									<div className="av-dot" />
									<div className="av-text">
										<strong>{t} — </strong>
										{d}
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="about-right">
						{[
							{ n: '9', l: 'Active Events' },
							{ n: '5', l: 'Roles Supported' },
							{ n: '100%', l: 'Audit Coverage' },
							{ n: '₹0', l: 'Setup Cost' },
						].map((s) => (
							<div
								className="astat"
								key={s.l}>
								<div className="astat-n">{s.n}</div>
								<div className="astat-l">{s.l}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ──────────────────────────────────────────────── */}
			<section className="hp-cta-sec">
				<div className="hp-sec-ey">Get Started Today</div>
				<h2 className="hp-sec-h2">
					Ready to transform your <em>operations?</em>
				</h2>
				<p className="hp-sec-sub">
					Join banquet halls across Mumbai using BanquetPro to run smoother
					events, happier guests, and cleaner books.
				</p>
				<div className="hp-cta-btns">
					<button
						className="hp-btn-prim"
						onClick={() => navigate('/dashboard')}>
						Open Dashboard
					</button>
					<button
						className="hp-btn-sec"
						style={{ color: '#0A1F44', borderColor: 'rgba(10,31,68,0.25)' }}
						onClick={() => scrollTo('about')}>
						Learn More
					</button>
				</div>
			</section>

			{/* ── FOOTER ───────────────────────────────────────────── */}
			<footer className="hp-footer">
				<div className="hp-footer-top">
					<div className="hf-brand">
						<div
							className="hp-logo"
							style={{ marginBottom: 16 }}>
							<div className="hp-logo-mark">B</div>
							<div className="hp-logo-text">
								Banquet<span>Pro</span>
							</div>
						</div>
						<p className="hf-brand-desc">
							The complete event operations platform for Indian banquet halls.
							Manage enquiries, bookings, guests, and finances — all in one
							place.
						</p>
						<div className="hf-brand-badge">Hackniche Hospitality · 2026</div>
					</div>

					<div>
						<div className="hf-col-title">Navigate</div>
						<div className="hf-links">
							{[
								['Home', () => window.scrollTo({ top: 0, behavior: 'smooth' })],
								['About Us', () => scrollTo('about')],
								['Features', () => scrollTo('features')],
								['Dashboard', () => navigate('/dashboard')],
							].map(([l, fn]) => (
								<button
									key={l}
									className="hf-link"
									onClick={fn}>
									{l}
								</button>
							))}
						</div>
					</div>

					<div>
						<div className="hf-col-title">Platform</div>
						<div className="hf-links">
							{[
								['Sales Dashboard', '/dashboard'],
								['Event Detail', '/'],
								['Audit Log', '/audit'],
								['Analytics', '/analytics'],
							].map(([l, path]) => (
								<button
									key={l}
									className="hf-link"
									onClick={() => navigate(path)}>
									{l}
								</button>
							))}
						</div>
					</div>

					<div>
						<div className="hf-col-title">Contact</div>
						<div className="hf-links">
							{[
								['info@banquetpro.in', null],
								['+91 98765 00000', null],
								['Mumbai, Maharashtra', null],
								['Support Portal', null],
							].map(([l]) => (
								<button
									key={l}
									className="hf-link"
									style={{
										cursor: l.includes('Portal') ? 'pointer' : 'default',
									}}>
									{l}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="hp-footer-bottom">
					<div className="hf-copy">
						© 2026 BanquetPro · Hackniche Hospitality · All rights reserved
					</div>
					<div className="hf-social">
						{['✗', 'in', 'f', '◈'].map((s, i) => (
							<button
								className="hf-soc-btn"
								key={i}>
								{s}
							</button>
						))}
					</div>
				</div>
			</footer>
		</>
	);
}
