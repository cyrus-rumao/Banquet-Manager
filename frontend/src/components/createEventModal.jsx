import { useState } from 'react';
import { checkConflict, createEvent } from '../services/eventService';

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

const venues = [
	{
		_id: '69c3edcc1a825bbf87c1ff8f',
		hall: 'Crystal Ballroom',
		location: '123 Marine Drive, Mumbai',
	},
	{
		_id: '69c3edcc1a825bbf87c1ff90',
		hall: 'Sunset Rooftop',
		location: '45 Bandra West, Mumbai',
	},
	{
		_id: '69c3edcc1a825bbf87c1ff91',
		hall: 'Emerald Garden Lawn',
		location: '78 Juhu Beach Road, Mumbai',
	},
	{
		_id: '69c3edcc1a825bbf87c1ff92',
		hall: 'Royal Banquet Hall B',
		location: '12 Andheri East, Mumbai',
	},
	{
		_id: '69c3edcc1a825bbf87c1ff93',
		hall: 'Ocean View Terrace',
		location: '5 Worli Sea Face, Mumbai',
	},
];

const CreateEventModal = ({ setShowModal, refresh }) => {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [form, setForm] = useState({
		partyName: '',
		eventType: '',
		venue: '',
		startDateTime: '',
		endDateTime: '',
		client: {
			name: '',
			phone: '',
			email: '',
			address: '',
		},
		headcount: 0,
	});

	const handleChange = (field, value) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleClient = (field, value) => {
		setForm((prev) => ({
			...prev,
			client: { ...prev.client, [field]: value },
		}));
	};

	const handleNext = async () => {
		setError('');

		if (
			!form.partyName ||
			!form.eventType ||
			!form.venue ||
			!form.startDateTime ||
			!form.endDateTime
		) {
			return setError('Fill all fields');
		}

		if (new Date(form.startDateTime) >= new Date(form.endDateTime)) {
			return setError('End time must be after start time');
		}

		try {
			setLoading(true);

			const res = await checkConflict({
				venue: form.venue,
				startDateTime: form.startDateTime,
				endDateTime: form.endDateTime,
			});

			if (res.data.ok) {
				setStep(2);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Venue already booked');
		} finally {
			setLoading(false);
		}
	};

	const submit = async () => {
		try {
			setLoading(true);

			await createEvent({
				partyName: form.partyName,
				eventType: form.eventType,
				venue: form.venue,
				schedule: {
					startDateTime: form.startDateTime,
					endDateTime: form.endDateTime,
				},
				client: form.client,
				headcount: {
					expected: Number(form.headcount),
				},
			});

			refresh();
			setShowModal(false);
		} catch (err) {
			setError('Failed to create event');
		} finally {
			setLoading(false);
		}
	};

	const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
    
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    
    .modal-overlay{position:fixed;inset:0;background:rgba(10,31,68,0.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    
    .modal{position:fixed;inset:0;background:rgba(10,31,68,0.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
    
    .modal-card{background:#F5F1E8;border-radius:8px;width:100%;max-width:500px;padding:48px 40px;box-shadow:0 25px 80px rgba(10,31,68,0.25),0 8px 24px rgba(10,31,68,0.12);position:relative;animation:slideUp 0.4s cubic-bezier(.16,1,.3,1)}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    
    .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
    
    .step-indicator{display:flex;gap:8px;align-items:center}
    .step{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:1px;background:rgba(10,31,68,0.08);color:rgba(10,31,68,0.35);transition:all 0.2s}
    .step.active{background:#C9973A;color:#F5F1E8}
    .step-divider{width:16px;height:1px;background:rgba(10,31,68,0.12)}
    
    .close-btn{background:none;border:none;font-size:24px;color:#0A1F44;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;padding:0}
    .close-btn:hover{color:#C9973A;transform:scale(1.1)}
    
    .sec-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:#0A1F44;line-height:1.2;letter-spacing:-0.5px;margin-bottom:28px}
    
    .form-group{margin-bottom:20px;display:flex;flex-direction:column;gap:6px}
    
    input,select{font-family:'DM Sans',sans-serif;width:100%;padding:14px 16px;border:1.5px solid rgba(10,31,68,0.12);border-radius:4px;font-size:14px;color:#0A1F44;background:#FFFFFF;transition:all 0.2s;outline:none}
    input::placeholder{color:rgba(10,31,68,0.35)}
    input:focus,select:focus{border-color:#C9973A;background:#FFFFFF;box-shadow:0 0 0 3px rgba(201,151,58,0.1)}
    
    select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%230A1F44' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px}
    
    .error{background:rgba(220,53,69,0.1);border:1.5px solid rgba(220,53,69,0.3);color:#8B0000;padding:12px 14px;border-radius:4px;font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:20px;line-height:1.4}
    
    .btn-group{display:flex;gap:12px;margin-top:32px}
    
    button{font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;font-size:14px;font-weight:500;letter-spacing:0.5px}
    
    .btn-primary{background:#C9973A;color:#0A1F44;padding:14px 28px;border-radius:4px;flex:1;font-size:15px;font-weight:600}
    .btn-primary:hover:not(:disabled){background:#E8B84B;transform:translateY(-2px);box-shadow:0 8px 20px rgba(201,151,58,0.25)}
    .btn-primary:disabled{opacity:0.6;cursor:not-allowed}
    
    .btn-secondary{background:rgba(10,31,68,0.08);color:#0A1F44;padding:14px 24px;border-radius:4px;flex:1}
    .btn-secondary:hover:not(:disabled){background:rgba(10,31,68,0.12);transform:translateY(-2px)}
    .btn-secondary:disabled{opacity:0.6;cursor:not-allowed}
    
    .flex{display:flex;gap:12px}
    
    .input-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(10,31,68,0.5);text-transform:uppercase;margin-bottom:4px}
    
    @media(max-width:640px){
      .modal-card{padding:32px 24px;max-width:100%}
      .sec-title{font-size:24px;margin-bottom:20px}
      .form-group{margin-bottom:16px}
      input,select{padding:12px 14px;font-size:13px}
      .btn-group{flex-direction:column;gap:10px}
      .btn-primary,.btn-secondary{padding:12px 20px}
    }
  `;

	return (
		<>
			<style>{styles}</style>
			<div className="modal">
				<div className="modal-card">
					<div className="modal-header">
						<div className="step-indicator">
							<div className={`step ${step === 1 ? 'active' : ''}`}>1</div>
							<div className="step-divider"></div>
							<div className={`step ${step === 2 ? 'active' : ''}`}>2</div>
						</div>
						<button
							className="close-btn"
							onClick={() => setShowModal(false)}>
							×
						</button>
					</div>

					{error && <div className="error">⚠ {error}</div>}

					{/* STEP 1 - EVENT DETAILS */}
					{step === 1 && (
						<>
							<h2 className="sec-title">Event Details</h2>

							<div className="form-group">
								<label className="input-label">Event Name</label>
								<input
									placeholder="Enter event name"
									onChange={(e) => handleChange('partyName', e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">Event Type</label>
								<select
									onChange={(e) => handleChange('eventType', e.target.value)}>
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

							<div className="form-group">
								<label className="input-label">Venue</label>
								<select onChange={(e) => handleChange('venue', e.target.value)}>
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

							<div className="form-group">
								<label className="input-label">Start Date & Time</label>
								<input
									type="datetime-local"
									onChange={(e) =>
										handleChange('startDateTime', e.target.value)
									}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">End Date & Time</label>
								<input
									type="datetime-local"
									onChange={(e) => handleChange('endDateTime', e.target.value)}
								/>
							</div>

							<div className="btn-group">
								<button
									className="btn-primary"
									onClick={handleNext}
									disabled={loading}>
									{loading ? 'Checking Venue...' : 'Next →'}
								</button>
							</div>
						</>
					)}

					{/* STEP 2 - CLIENT DETAILS */}
					{step === 2 && (
						<>
							<h2 className="sec-title">Client Details</h2>

							<div className="form-group">
								<label className="input-label">Full Name</label>
								<input
									placeholder="Client name"
									onChange={(e) => handleClient('name', e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">Phone</label>
								<input
									placeholder="+91 XXXXX XXXXX"
									onChange={(e) => handleClient('phone', e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">Email</label>
								<input
									type="email"
									placeholder="client@example.com"
									onChange={(e) => handleClient('email', e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">Address</label>
								<input
									placeholder="Street address"
									onChange={(e) => handleClient('address', e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label className="input-label">Expected Headcount</label>
								<input
									type="number"
									placeholder="Number of guests"
									onChange={(e) => handleChange('headcount', e.target.value)}
								/>
							</div>

							<div className="flex">
								<button
									className="btn-secondary"
									onClick={() => setStep(1)}>
									← Back
								</button>
								<button
									className="btn-primary"
									onClick={submit}
									disabled={loading}>
									{loading ? 'Creating...' : 'Create Event'}
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default CreateEventModal;
