import mongoose from 'mongoose';

/**
 * EVENT STATUS LIFECYCLE:
 *
 * TEMPORARY_ENQUIRY  →  ENQUIRY_CONFIRMED  →  DEPOSIT_RECEIVED
 *       ↓                                           ↓
 *  CANCELLED                               BOOKED (fully confirmed)
 *       ↑                                           ↓
 *  (any stage)                              IN_PROGRESS (event day)
 *                                                   ↓
 *                                            COMPLETED
 *
 * Status transitions:
 * - SALES creates → TEMPORARY_ENQUIRY
 * - SALES confirms details → ENQUIRY_CONFIRMED
 * - FINANCE logs deposit → DEPOSIT_RECEIVED
 * - FINANCE triggers payment flag → BOOKED
 * - Auto/ADMIN on event day → IN_PROGRESS
 * - ADMIN/FINANCE after settlement → COMPLETED
 * - Any role with permission → CANCELLED
 *
 * Who can change status:
 * TEMPORARY_ENQUIRY  → ENQUIRY_CONFIRMED : SALES, ADMIN
 * ENQUIRY_CONFIRMED  → DEPOSIT_RECEIVED  : FINANCE, ADMIN
 * DEPOSIT_RECEIVED   → BOOKED            : FINANCE, ADMIN  ← THE KEY TOGGLE
 * BOOKED             → IN_PROGRESS       : ADMIN (or auto)
 * IN_PROGRESS        → COMPLETED         : ADMIN, FINANCE
 * Any               → CANCELLED         : ADMIN, FINANCE
 */

const EVENT_STATUSES = [
	'TEMPORARY_ENQUIRY',
	'ENQUIRY_CONFIRMED',
	'DEPOSIT_RECEIVED',
	'BOOKED',
	'IN_PROGRESS',
	'COMPLETED',
	'CANCELLED',
];

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

const EventSchema = new mongoose.Schema(
	{
		// ── Identification ──────────────────────────────────────────────────────
		eventCode: {
			type: String,
			unique: true,
			// Auto-generated: BNQ-2025-XXXX
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		partyName: {
			type: String,
			required: [true, 'Party name is required'],
			trim: true,
		},

		eventType: {
			type: String,
			enum: EVENT_TYPES,
			required: true,
		},

		// ── Client Details ──────────────────────────────────────────────────────
		client: {
			name: { type: String, required: true, trim: true },
			phone: { type: String, required: true, trim: true },
			email: { type: String, trim: true, lowercase: true, required: true },
			address: { type: String },
		},

		// ── GST / Billing ───────────────────────────────────────────────────────
		billing: {
			gstNumber: { type: String, trim: true },
			companyName: { type: String, trim: true }, // if corporate event
			billingAddress: { type: String },
			gstRate: { type: Number, default: 18 }, // percentage
		},

		// ── Event Schedule ──────────────────────────────────────────────────────
		schedule: {
			startDateTime: {
				type: Date,
				required: [true, 'Event start date/time is required'],
			},
			endDateTime: {
				type: Date,
				required: [true, 'Event end date/time is required'],
			},
			setupTime: { type: Date }, // when kitchen/ops should arrive
			teardownTime: { type: Date },
		},

		// ── Venue ───────────────────────────────────────────────────────────────
		// ── Guest Count ─────────────────────────────────────────────────────────
		headcount: {
			expected: {
				type: Number,
				required: [true, 'Expected headcount is required'],
				min: 1,
			},
			arrived: {
				type: Number,
				default: 0, // updated live during check-in
			},
			isJain: {
				type: Number,
				default: 0, // subset of headcount with JAIN dietary preference
			},
		},

		// ── Linked Documents ────────────────────────────────────────────────────
		menu: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Menu',
		},
		venue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Venue',
		},

		payments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Payment',
			},
		],

		guests: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Guest',
			},
		],

		// ── Status & Workflow ───────────────────────────────────────────────────
		status: {
			type: String,
			enum: EVENT_STATUSES,
			default: 'TEMPORARY_ENQUIRY',
			required: true,
		},

		// Who manages this event
		eventManager: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		// Who first created the record (for audit)
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		// ── WhatsApp Dispatch Tracking ──────────────────────────────────────────
		whatsappLog: {
			poSentAt: Date, // Purchase Order → client
			fpSentAt: Date, // Function Prospectus → internal team
			qrSentCount: { type: Number, default: 0 },
			lastReminderSentAt: Date,
		},
		// ── Post-Event ──────────────────────────────────────────────────────────
		postEvent: {
			completedAt: Date,
			kitchenFeedback: String,
			greFeedback: String,
			clientRating: { type: Number, min: 1, max: 5 },
			clientFeedback: String,
			// AI-generated summary from Featherless.ai
			aiSummary: String,
		},
	},
	{
		timestamps: true,
	},
);

// ─── Pre-save: auto-generate eventCode ───────────────────────────────────────
EventSchema.pre('save', async function () {
	if (!this.eventCode) {
		const year = new Date().getFullYear();
		const count = await mongoose.model('Event').countDocuments();
		this.eventCode = `BNQ-${year}-${String(count + 1).padStart(4, '0')}`;
	}
});

// ─── Index: fast conflict detection queries ───────────────────────────────────
EventSchema.index({ 'schedule.startDateTime': 1, 'venue.hall': 1, status: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ 'client.phone': 1 });
EventSchema.index({ eventManager: 1 });

EventSchema.statics.EVENT_STATUSES = EVENT_STATUSES;

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

export default Event;
