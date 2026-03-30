const mongoose = require('mongoose');

/**
 * NotificationSchema
 * Tracks every outbound notification — WhatsApp, SMS, Email.
 * Used by the cron job for installment reminders.
 * Powers the whatsappLog on Event schema.
 *
 * ACCESS:
 * ADMIN   → full read
 * FINANCE → read (payment reminders)
 * SALES   → read (their event notifications)
 * GRE     → read (QR dispatch confirmations)
 */

const NotificationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    type: {
      type: String,
      enum: [
        'PURCHASE_ORDER',         // PO → client (triggered on payment confirmation)
        'FUNCTION_PROSPECTUS',    // FP → internal team
        'QR_CODE_DELIVERY',       // QR → guest on RSVP confirmation
        'RSVP_INVITATION',        // invite link → guest
        'PAYMENT_REMINDER',       // installment due reminder → client
        'PAYMENT_OVERDUE',        // overdue installment → client + finance
        'BOOKING_CONFIRMATION',   // confirmed booking → client
        'EVENT_REMINDER',         // event coming up → client (D-3, D-1)
        'CANCELLATION_NOTICE',    // event cancelled → client
        'SONG_REQUEST_ACK',       // DJ song request acknowledged → guest
      ],
      required: true,
    },

    channel: {
      type: String,
      enum: ['WhatsApp', 'SMS', 'Email'],
      required: true,
    },

    recipient: {
      name: String,
      phone: String,
      email: String,
      // could be guest, client, or internal team member
    },

    // Twilio/provider message SID for delivery tracking
    providerMessageId: String,

    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ'],
      default: 'QUEUED',
    },

    failureReason: String,

    // Content snapshot (for audit)
    messageBody: String,
    attachmentUrl: String, // PDF URL for PO/FP, QR image URL

    // For payment reminders — which installment this is about
    relatedInstallment: {
      installmentId: mongoose.Schema.Types.ObjectId,
      amount: Number,
      dueDate: Date,
    },

    // For guest notifications
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // null = system/cron triggered
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    deliveredAt: Date,
    readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ event: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, type: 1 });
NotificationSchema.index({ guest: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);