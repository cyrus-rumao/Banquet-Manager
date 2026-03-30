import { useEffect, useState } from 'react';
import { getMyEvents } from '../../services/eventService';
import CreateEventModal from '../../components/createEventModal';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
	const [events, setEvents] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const navigate = useNavigate();

	const logout = () => {
		localStorage.removeItem('user');
		window.location.href = '/';
	};

	const fetchEvents = async () => {
		try {
			const res = await getMyEvents();
			setEvents(res.data);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
    
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    
    .app{font-family:'DM Sans',sans-serif;background:#E8E4DC;color:#0A1F44;min-height:100vh;overflow-x:hidden}
    
    .ud-top{background:#0A1F44;position:relative;overflow:hidden;padding:88px 64px 64px;display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
    .ud-top::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
    .ud-top::after{content:'';position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(201,151,58,0.15) 0%,transparent 65%);top:-300px;right:-150px;pointer-events:none}
    
    .h1{font-family:'Playfair Display',serif;font-size:clamp(48px,6vw,72px);font-weight:900;line-height:0.88;color:#FFFFFF;letter-spacing:-3px;position:relative;z-index:2}
    .h1 .outline{display:block;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,0.2);padding-left:48px;margin-top:4px}
    
    .logout-btn{position:relative;z-index:2;background:rgba(201,151,58,0.15);border:1.5px solid #C9973A;color:#C9973A;padding:12px 28px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;border-radius:100px;font-weight:500}
    .logout-btn:hover{background:#C9973A;color:#0A1F44}
    
    .ud-actions{max-width:1440px;margin:0 auto;padding:48px 64px 24px;display:flex;gap:16px}
    .primary-btn{background:#C9973A;color:#0A1F44;border:none;padding:16px 32px;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;cursor:pointer;transition:all 0.2s;border-radius:4px;letter-spacing:-0.5px}
    .primary-btn:hover{background:#E8B84B;transform:translateY(-2px);box-shadow:0 12px 32px rgba(201,151,58,0.25)}
    
    .grid{max-width:1440px;margin:0 auto;padding:24px 64px 80px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
    
    .card{background:#F5F1E8;border:1.5px solid rgba(10,31,68,0.12);padding:32px 28px;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.25s cubic-bezier(.16,1,.3,1),box-shadow 0.25s cubic-bezier(.16,1,.3,1),border-color 0.2s,background 0.2s;animation:rise 0.45s ease both;border-left:4px solid #C9973A}
    @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    
    .card:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(10,31,68,0.12),0 4px 12px rgba(10,31,68,0.08);border-color:#C9973A}
    
    .cname{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#0A1F44;line-height:1.2;margin-bottom:12px}
    
    .cph{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;color:#5A6A8A;text-transform:uppercase;font-weight:500}
    
    .empty{text-align:center;padding:120px 64px;font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:rgba(10,31,68,0.18)}
    
    @media(max-width:768px){
      .ud-top{padding:48px 24px 40px}
      .ud-actions,.grid{padding-left:24px;padding-right:24px}
      .h1{font-size:clamp(36px,5vw,48px)}
      .h1 .outline{padding-left:32px}
      .grid{grid-template-columns:1fr}
      .logout-btn{padding:10px 20px;font-size:9px}
    }
  `;

	return (
		<>
			<style>{styles}</style>
			<div className="app">
				<div className="ud-top">
					<h1 className="h1">
						User<span className="outline">Dashboard</span>
					</h1>
					<button
						className="logout-btn"
						onClick={logout}>
						Logout
					</button>
				</div>

				<div className="ud-actions">
					<button
						className="primary-btn"
						onClick={() => setShowModal(true)}>
						+ Create New Event
					</button>
				</div>

				{events.length === 0 ? (
					<div className="empty">No events yet. Create one to get started!</div>
				) : (
					<div className="grid">
						{events.map((e, idx) => (
							<div
								onClick={() => navigate('/events/' + e._id)}
								key={e._id}
								className="card"
								style={{ animationDelay: `${idx * 35}ms` }}>
								<div className="cname">{e.partyName}</div>
								<div className="cph">{e.eventType}</div>
							</div>
						))}
					</div>
				)}

				{showModal && (
					<CreateEventModal
						setShowModal={setShowModal}
						refresh={fetchEvents}
					/>
				)}
			</div>
		</>
	);
};

export default UserDashboard;
