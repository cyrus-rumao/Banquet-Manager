import mongoose from 'mongoose';

/**
 * PaymentSchema
 * Tracks the complete financial lifecycle of an event.
 *
 * ACCESS:
 * ADMIN   → full CRUD
 * FINANCE → full CRUD — the primary user of this model
 * SALES   → read only (see total package value, status)
 * GRE     → no access
 *
 * PAYMENT FLOW:
 * 1. SALES creates event → Payment record initialized with packageValue
 * 2. Client pays deposit → FINANCE logs as first installment
 * 3. FINANCE sets paymentStatus = DEPOSIT_RECEIVED
 * 4. FINANCE toggles confirmationFlag → event.status becomes BOOKED
 * 5. Remaining installments tracked with due dates + auto reminders
 * 6. Final settlement → paymentStatus = FULLY_SETTLED
 */

const InstallmentSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
			min: 0,
		},

		dueDate: {
			type: Date,
			required: true,
		},

		paidAt: {
			type: Date,
			// null = not yet paid
		},

		paymentMode: {
			type: String,
			enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'],
		},

		referenceNumber: {
			type: String,
			trim: true,
			// UTR, cheque number, transaction ID, etc.
		},

		remarks: String,

		status: {
			type: String,
			enum: ['PENDING', 'PAID', 'OVERDUE', 'WAIVED'],
			default: 'PENDING',
		},

		// Logged by which Finance user
		recordedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},

		// Reminder tracking for this installment
		remindersSent: {
			type: Number,
			default: 0,
		},
		lastReminderAt: Date,
	},
	{ _id: true },
);

const PaymentSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
			required: true,
			unique: true, // one payment record per event
		},

		// ── Package Financials ──────────────────────────────────────────────────
		packageValue: {
			type: Number,
			required: [true, 'Package value is required'],
			min: 0,
			// Base: menu.estimatedTotalCost
		},

		gstAmount: {
			type: Number,
			default: 0,
			// Computed from packageValue × billing.gstRate / 100
		},

		discountAmount: {
			type: Number,
			default: 0,
		},

		discountReason: {
			type: String,
		},

		// packageValue + gstAmount - discountAmount
		totalPayable: {
			type: Number,
			required: true,
			min: 0,
		},

		// ── Installments ────────────────────────────────────────────────────────
		installments: [InstallmentSchema],

		// ── Computed (auto-updated on installment save) ─────────────────────────
		totalPaid: {
			type: Number,
			default: 0,
		},

		balanceRemaining: {
			type: Number,
			default: 0,
		},

		// ── Payment Status ──────────────────────────────────────────────────────
		paymentStatus: {
			type: String,
			enum: [
				'PENDING', // no payment received yet
				'DEPOSIT_RECEIVED', // first installment paid
				'PARTIALLY_PAID', // some installments done, balance remaining
				'FULLY_SETTLED', // all paid
				'REFUNDED', // event cancelled, money returned
				'DISPUTED', // under discussion
			],
			default: 'PENDING',
		},

		// ── THE KEY TOGGLE (Phase B) ────────────────────────────────────────────
		// Only FINANCE role can set this to true.
		// Setting this true → triggers event.status = 'BOOKED'
		// Also triggers WhatsApp PO to client via Twilio.
		confirmationFlag: {
			type: Boolean,
			default: false,
		},

		confirmedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			// The FINANCE user who flipped the flag
		},

		confirmedAt: {
			type: Date,
		},

		// ── Refund (on cancellation) ────────────────────────────────────────────
		refund: {
			amount: Number,
			processedAt: Date,
			processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			referenceNumber: String,
			notes: String,
		},

		// Created/managed by
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		lastUpdatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true },
);

// ─── Pre-save: recompute totalPaid and balanceRemaining ──────────────────────
PaymentSchema.pre('save', function (next) {
	this.totalPaid = this.installments
		.filter((i) => i.status === 'PAID')
		.reduce((sum, i) => sum + i.amount, 0);

	this.balanceRemaining = this.totalPayable - this.totalPaid;

	// Auto-update overdue installments
	const now = new Date();
	this.installments.forEach((inst) => {
		if (inst.status === 'PENDING' && inst.dueDate < now) {
			inst.status = 'OVERDUE';
		}
	});

	// Auto-derive paymentStatus
	if (this.totalPaid === 0) {
		this.paymentStatus = 'PENDING';
	} else if (this.balanceRemaining <= 0) {
		this.paymentStatus = 'FULLY_SETTLED';
	} else if (this.totalPaid > 0) {
		const isFirstInstallment =
			this.installments.filter((i) => i.status === 'PAID').length === 1;
		this.paymentStatus = isFirstInstallment
			? 'DEPOSIT_RECEIVED'
			: 'PARTIALLY_PAID';
	}
});

// ─── Index for reminder cron job queries ─────────────────────────────────────
PaymentSchema.index({ 'installments.dueDate': 1, 'installments.status': 1 });
PaymentSchema.index({ paymentStatus: 1 });

const Payment =
	mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;
