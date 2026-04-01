import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { checkConflict } from '../services/eventService';
import { useVenueStore } from '../stores/usevenueStore';
// import { get } from 'mongoose';

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

const CreateEventModal = ({ setShowModal }) => {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { venues, getVenues } = useVenueStore();
	// const [venues, setVenues] = useState([]);
	useEffect(() => {
		getVenues();
	}, []);

	const [partyName, setPartyName] = useState('');
	const [eventType, setEventType] = useState('');
	const [venue, setVenue] = useState('');
	const [startDateTime, setStartDateTime] = useState('');
	const [endDateTime, setEndDateTime] = useState('');
	const [clientName, setClientName] = useState('');
	const [clientPhone, setClientPhone] = useState('');
	const [clientEmail, setClientEmail] = useState('');
	const [clientAddress, setClientAddress] = useState('');
	const [headcount, setHeadcount] = useState(0);
	// Fetch venues on mount
	// useEffect(() => {
	// 	setVenues(getVenues());
	// }, [getVenues]);

	// const handleChange = (field, value) => {
	// 	setForm((prev) => ({ ...prev, [field]: value }));
	// };

	const handleNext = async () => {
		setError('');
		if (!partyName || !eventType || !venue || !startDateTime || !endDateTime) {
			return setError('Fill all fields');
		}
		if (new Date(startDateTime) >= new Date(endDateTime)) {
			return setError('End time must be after start time');
		}

		try {
			setLoading(true);
			const res = await checkConflict({
				venue: venue,
				startDateTime: startDateTime,
				endDateTime: endDateTime,
			});
			if (res.data.ok) setStep(2);
		} catch (err) {
			setError(err.response?.data?.message || 'Venue already booked');
		} finally {
			setLoading(false);
		}
	};

	const submit = async () => {
		try {
			setLoading(true);
			await axios.post('/events/create-event', {
				partyName: partyName,
				eventType: eventType,
				venue: venue,
				schedule: {
					startDateTime: startDateTime,
					endDateTime: endDateTime,
				},
				client: {
					name: clientName,
					phone: clientPhone,
					email: clientEmail,
					address: clientAddress,
				},
				headcount: { expected: Number(headcount) },
			});
			setShowModal(false);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create event');
		} finally {
			setLoading(false);
		}
	};

	// Reusable Input Component to keep code clean

	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-[#0A1F44]/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="relative w-full max-w-[500px]  overflow-y-auto bg-[#F5F1E8] rounded-lg shadow-2xl p-10 md:p-12 animate-in slide-in-from-bottom-5 duration-400">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-2">
						<div
							className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] tracking-wider transition-colors ${step === 1 ? 'bg-[#C9973A] text-[#F5F1E8]' : 'bg-[#0A1F44]/10 text-[#0A1F44]/35'}`}>
							1
						</div>
						<div className="w-4 h-[1px] bg-[#0A1F44]/10"></div>
						<div
							className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] tracking-wider transition-colors ${step === 2 ? 'bg-[#C9973A] text-[#F5F1E8]' : 'bg-[#0A1F44]/10 text-[#0A1F44]/35'}`}>
							2
						</div>
					</div>
					<button
						onClick={() => setShowModal(false)}
						className="text-2xl text-[#0A1F44] hover:text-[#C9973A] transition-transform hover:scale-110">
						×
					</button>
				</div>

				{error && (
					<div className="mb-5 p-3.5 bg-red-50 border-[1.5px] border-red-200 text-red-800 text-sm rounded font-sans leading-relaxed">
						⚠ {error}
					</div>
				)}

				{step === 1 ? (
					<>
						<h2 className="font-playfair text-3xl font-bold text-[#0A1F44] mb-7 leading-tight tracking-tight">
							Event Details
						</h2>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="partyName"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Event Name
							</label>
							<input
								id="partyName"
								className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
								placeholder="Enter event name"
								onChange={(e) => setPartyName(e.target.value)}
								value={partyName}
							/>
						</div>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="eventType"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Event Type
							</label>
							<select
								id="eventType"
								className={`w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35 appearance-none bg-[url("data:image/svg+xml,%3Csvg_xmlns='http://www.w3.org/2000/svg'_width='12'_height='8'_viewBox='0_0_12_8'%3E%3Cpath_fill='%230A1F44'_d='M1_1l5_5_5-5'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] pr-10`}
								onChange={(e) => setEventType(e.target.value)}
								value={eventType}>
								<option value="">Select event type</option>
								{EVENT_TYPES.map((t) => (
									<option
										key={t}
										value={t}>
										{t}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="venue"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Venue
							</label>
							<select
								id="venue"
								className={`w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35 appearance-none bg-[url("data:image/svg+xml,%3Csvg_xmlns='http://www.w3.org/2000/svg'_width='12'_height='8'_viewBox='0_0_12_8'%3E%3Cpath_fill='%230A1F44'_d='M1_1l5_5_5-5'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] pr-10`}
								onChange={(e) => setVenue(e.target.value)}
								value={venue}>
								<option value="">Select venue</option>
								{venues.map((v) => (
									<option
										key={v._id}
										value={v._id}>
										{v.hall} — {v.location}
									</option>
								))}
							</select>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1 mb-5">
								<label
									htmlFor="startDateTime"
									className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
									Start Date & Time
								</label>
								<input
									type="datetime-local"
									className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
									onChange={(e) => setStartDateTime(e.target.value)}
									value={startDateTime}
								/>
							</div>
							<div className="flex flex-col gap-1 mb-5">
								<label
									htmlFor="endDateTime"
									className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
									End Date & Time
								</label>
								<input
									type="datetime-local"
									className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
									onChange={(e) => setEndDateTime(e.target.value)}
									value={endDateTime}
								/>
							</div>
						</div>

						<button
							className="w-full mt-8 bg-[#C9973A] text-[#0A1F44] py-3.5 rounded font-sans font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
							onClick={handleNext}
							disabled={loading}>
							{loading ? 'Checking Venue...' : 'Next →'}
						</button>
					</>
				) : (
					<>
						<h2 className="font-playfair text-3xl font-bold text-[#0A1F44] mb-7 leading-tight tracking-tight">
							Client Details
						</h2>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="name"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Client Name
							</label>
							<input
								className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
								placeholder="Client name"
								onChange={(e) => setClientName(e.target.value)}
								value={clientName}
							/>
						</div>

						<div className="md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1 mb-5">
								<label
									htmlFor="phone"
									className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
									Client Phone
								</label>
								<input
									type="number"
									className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
									placeholder="Client phone"
									onChange={(e) => setClientPhone(e.target.value)}
									value={clientPhone}
								/>
							</div>
							<div className="flex flex-col gap-1 mb-5">
								<label
									htmlFor="partyName"
									className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
									Event Name
								</label>
								<input
									type="email"
									className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
									placeholder="client@example.com"
									onChange={(e) => setClientEmail(e.target.value)}
									value={clientEmail}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="partyName"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Event Name
							</label>
							<input
								className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
								placeholder="Street address"
								onChange={(e) => setClientAddress(e.target.value)}
								value={clientAddress}
							/>
						</div>

						<div className="flex flex-col gap-1 mb-5">
							<label
								htmlFor="partyName"
								className="font-mono text-[10px] tracking-[2px] text-[#0A1F44]/50 uppercase">
								Event Name
							</label>
							<input
								type="number"
								className="w-full px-4 py-3.5 border-[1.5px] border-[#0A1F44]/10 rounded font-sans text-sm text-[#0A1F44] bg-white outline-none transition-all focus:border-[#C9973A] focus:ring-4 focus:ring-[#C9973A]/10 placeholder:text-[#0A1F44]/35"
								placeholder="Number of guests"
								onChange={(e) => setHeadcount(e.target.value)}
								value={headcount}
							/>
						</div>

						<div className="flex gap-3 mt-8">
							<button
								className="flex-1 bg-[#0A1F44]/10 text-[#0A1F44] py-3.5 rounded font-sans font-medium transition-all hover:-translate-y-0.5"
								onClick={() => setStep(1)}>
								← Back
							</button>
							<button
								className="flex-[2] bg-[#C9973A] text-[#0A1F44] py-3.5 rounded font-sans font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
								onClick={submit}
								disabled={loading}>
								{loading ? 'Creating...' : 'Create Event'}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default CreateEventModal;
