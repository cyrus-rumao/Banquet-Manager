import { useEffect, useState } from 'react';
import { getMyEvents } from '../../services/eventService';
import CreateEventModal from '../../components/createEventModal';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
	const [events, setEvents] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const navigate = useNavigate();

	

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await getMyEvents();
				setEvents(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		fetchEvents();
	}, []);

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#E8E4DC] text-[#0A1F44]">
			<div className="relative flex items-end justify-between gap-8 overflow-hidden bg-[#0A1F44] px-6 pt-12 pb-10 md:px-16 md:pt-[88px] md:pb-16">
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
						backgroundSize: '60px 60px',
					}}
				/>
				<div className="pointer-events-none absolute -top-[300px] -right-[150px] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(201,151,58,0.15)_0%,transparent_65%)]" />

				<h1 className="relative z-10 [font-family:'Playfair_Display',serif] text-[clamp(36px,5vw,72px)] font-black leading-[0.88] tracking-[-3px] text-white">
					User
					<span className="mt-1 block pl-8 text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] md:pl-12">
						Dashboard
					</span>
				</h1>
				{/* <button
					className="relative z-10 rounded-full border border-[#C9973A] bg-[rgba(201,151,58,0.15)] px-5 py-2.5 text-[9px] font-medium uppercase tracking-[2px] text-[#C9973A] transition-all duration-200 hover:bg-[#C9973A] hover:text-[#0A1F44] md:px-7 md:py-3 md:text-[10px]"
					onClick={logout}>
					Logout
				</button> */}
			</div>

			<div className="mx-auto flex max-w-[1440px] gap-4 px-6 pt-12 pb-6 md:px-16">
				<button
					className="rounded bg-[#C9973A] px-8 py-4 [font-family:'Playfair_Display',serif] text-lg font-bold tracking-[-0.5px] text-[#0A1F44] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E8B84B] hover:shadow-[0_12px_32px_rgba(201,151,58,0.25)]"
					onClick={() => setShowModal(true)}>
					+ Create New Event
				</button>
			</div>

			{events.length === 0 ? (
				<div className="px-6 py-28 text-center [font-family:'Playfair_Display',serif] text-2xl italic text-[rgba(10,31,68,0.18)] md:px-16 md:text-[28px]">
					No events yet. Create one to get started!
				</div>
			) : (
				<div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-6 pt-6 pb-20 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] md:px-16">
					{events.map((e) => (
						<div
							onClick={() => navigate('/events/' + e._id)}
							key={e._id}
							className="relative overflow-hidden border border-l-4 border-[rgba(10,31,68,0.12)] border-l-[#C9973A] bg-[#F5F1E8] px-7 py-8 transition-all duration-200 [transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:border-[#C9973A] hover:shadow-[0_20px_48px_rgba(10,31,68,0.12),0_4px_12px_rgba(10,31,68,0.08)]">
							<div className="mb-3 [font-family:'Playfair_Display',serif] text-[26px] font-bold leading-tight text-[#0A1F44]">
								{e.partyName}
							</div>
							<div className="[font-family:'DM_Mono',monospace] text-[11px] font-medium uppercase tracking-[2px] text-[#5A6A8A]">
								{e.eventType}
							</div>
						</div>
					))}
				</div>
			)}

			{showModal && (
				<CreateEventModal
					setShowModal={setShowModal}
					// refresh={fetchEvents}
				/>
			)}
		</div>
	);
};

export default UserDashboard;
