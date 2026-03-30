const mongoose = require('mongoose');

/**
 * AuditLogSchema
 * Immutable record of every significant action in the system.
 * This is the backbone of the "Single Source of Truth" claim.
 * 
 * ACCESS:
 * ADMIN   → read all logs
 * FINANCE → read logs for their actions + event financial logs
 * SALES   → read logs for events they manage
 * GRE     → read logs for check-in actions only
 *
 * NEVER update or delete audit logs — append only.
 * Use this for: dispute resolution, cancellation post-mortem,
 * compliance, and the Phase D AI audit feed.
 */

const AUDIT_ACTIONS = [
  // Event lifecycle
  'EVENT_CREATED',
  'EVENT_STATUS_CHANGED',
  'EVENT_UPDATED',
  'EVENT_CANCELLED',
  'EVENT_COMPLETED',

  // Menu
  'MENU_CREATED',
  'MENU_UPDATED',
  'MENU_LOCKED',

  // Finance — the most critical logs
  'PAYMENT_RECORD_CREATED',
  'INSTALLMENT_ADDED',
  'INSTALLMENT_MARKED_PAID',
  'PAYMENT_CONFIRMATION_TOGGLED',  // THE key toggle action
  'DISCOUNT_APPLIED',
  'REFUND_PROCESSED',

  // Guest / GRE
  'GUEST_ADDED',
  'GUEST_RSVP_CONFIRMED',
  'GUEST_RSVP_DECLINED',
  'GUEST_CHECKED_IN',             // QR scan action
  'GUEST_MARKED_NO_SHOW',
  'QR_SENT',

  // WhatsApp
  'WHATSAPP_PO_SENT',
  'WHATSAPP_FP_SENT',
  'WHATSAPP_REMINDER_SENT',

  // AI / System
  'AI_RECOMMENDATION_GENERATED',
  'CONFLICT_FLAGGED',
  'CONFLICT_RESOLVED',
  'CSV_IMPORTED',

  // Gallery / DJ
  'PHOTO_UPLOADED',
  'PHOTO_REMOVED',
  'PHOTO_FLAGGED_AI',
  'SONG_REQUEST_SUBMITTED',

  // Auth
  'USER_LOGIN',
  'USER_CREATED',
  'USER_ROLE_CHANGED',
];

const AuditLogSchema = new mongoose.Schema(
  {
    // ── What happened ───────────────────────────────────────────────────────
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },

    // Human-readable description
    description: {
      type: String,
      required: true,
    },

    // ── Who did it ──────────────────────────────────────────────────────────
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // null for system-generated actions (cron, auto-status)
    },

    performedByRole: {
      type: String,
      enum: ['ADMIN', 'SALES', 'FINANCE', 'GRE', 'SYSTEM', 'CLIENT'],
    },

    // ── What it affected ────────────────────────────────────────────────────
    targetModel: {
      type: String,
      enum: ['Event', 'Payment', 'Guest', 'Menu', 'MenuItem', 'User', 'GalleryImage', 'SongRequest'],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },

    // Always link to an event for easy per-event log filtering
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      // null for non-event actions like USER_CREATED, CSV_IMPORTED
    },

    // ── Change Snapshot ─────────────────────────────────────────────────────
    // Store before/after for critical fields
    changes: {
      before: { type: mongoose.Schema.Types.Mixed },
      after: { type: mongoose.Schema.Types.Mixed },
    },

    // ── Context ─────────────────────────────────────────────────────────────
    ipAddress: String,
    userAgent: String,

    // For payment confirmation specifically — store the financial snapshot
    financialSnapshot: {
      packageValue: Number,
      totalPaid: Number,
      balanceRemaining: Number,
      paymentStatus: String,
    },
  },
  {
    timestamps: true,
    // IMPORTANT: prevent updates to audit records
  }
);

// ─── Make audit logs immutable ────────────────────────────────────────────────
AuditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('AuditLog records cannot be modified');
});

AuditLogSchema.pre('updateOne', function () {
  throw new Error('AuditLog records cannot be modified');
});

AuditLogSchema.pre('updateMany', function () {
  throw new Error('AuditLog records cannot be modified');
});

// ─── Static helper: create log entry easily from anywhere ────────────────────
AuditLogSchema.statics.log = async function ({
  action,
  description,
  performedBy,
  performedByRole,
  targetModel,
  targetId,
  event,
  changes,
  financialSnapshot,
  ipAddress,
  userAgent,
}) {
  return await this.create({
    action,
    description,
    performedBy,
    performedByRole,
    targetModel,
    targetId,
    event,
    changes,
    financialSnapshot,
    ipAddress,
    userAgent,
  });
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
AuditLogSchema.index({ event: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ targetModel: 1, targetId: 1 });

AuditLogSchema.statics.AUDIT_ACTIONS = AUDIT_ACTIONS;

module.exports = mongoose.model('AuditLog', AuditLogSchema);