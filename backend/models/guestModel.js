import mongoose from 'mongoose';

/**
 * GuestSchema
 * One document per invited guest for a specific event.
 *
 * ACCESS:
 * ADMIN   → full CRUD
 * SALES   → create/read (upload guest list)
 * FINANCE → read only
 * GRE     → read + update arrivalStatus (the core check-in action)
 *
 * RSVP FLOW:
 * 1. SALES/client uploads guest list → Guest records created (INVITED)
 * 2. WhatsApp sent with RSVP link containing guest's unique token
 * 3. Guest opens link, confirms → rsvpStatus = CONFIRMED, QR generated
 * 4. QR sent to guest via WhatsApp
 * 5. Event day: GRE scans QR → arrivalStatus = ARRIVED, arrivedAt set
 */

const GuestSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
			required: true,
		},

		// ── Guest Identity ──────────────────────────────────────────────────────
		name: {
			type: String,
			required: [true, 'Guest name is required'],
			trim: true,
		},

		phone: {
			type: String,
			trim: true,
		},
		dietryPreferences: {
			type: String,
			trim: true,
			enum: ['VEG', 'JAIN'],
		},

		// ── RSVP Status ─────────────────────────────────────────────────────────
		rsvpStatus: {
			type: String,
			enum: ['INVITED', 'ARRIVED'],
			default: 'INVITED',
			required: true,
		},

		rsvpConfirmedAt: Date,

		// Song request submitted on RSVP page (feeds DJ interface)
		songRequest: {
			type: String,
			trim: true,
		},

		// ── QR Code ─────────────────────────────────────────────────────────────
		qrToken: {
			type: String,
			unique: true,
			sparse: true, // only set once RSVP confirmed
			// UUID or nanoid — encoded into QR image
		},

		qrCodeUrl: {
			type: String,
			// Base64 PNG or Cloudinary URL of the QR image
		},

		qrSentAt: Date,
	},
	{ timestamps: true },
);

// ─── Index for fast QR lookup (scan → match) ──────────────────────────────────
GuestSchema.index({ qrToken: 1 });
GuestSchema.index({ event: 1, rsvpStatus: 1 });
GuestSchema.index({ phone: 1 });

export default mongoose.model('Guest', GuestSchema);
