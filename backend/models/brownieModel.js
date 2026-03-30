import mongoose from 'mongoose';

/**
 * SongRequestSchema
 * Guest-submitted song requests, visible in real-time on the DJ interface.
 *
 * ACCESS:
 * ADMIN   → full CRUD
 * GRE     → read (can see requests for their event)
 * SALES   → read
 * FINANCE → no access
 * DJ VIEW → special read-only public route, no auth (token-gated by eventCode)
 * GUEST   → create via public RSVP page
 */
const SongRequestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      // null if submitted anonymously via public link
    },

    guestName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },

    songTitle: {
      type: String,
      required: true,
      trim: true,
    },

    artistName: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      // Optional dedication / message to the DJ
      maxlength: 200,
    },

    // Upvotes from other guests
    upvotes: {
      type: Number,
      default: 0,
    },

    // DJ marks this once played
    isPlayed: {
      type: Boolean,
      default: false,
    },

    playedAt: Date,

    // Priority order set by DJ
    djPriority: {
      type: Number,
      // lower = play sooner; null = not yet queued
    },

    status: {
      type: String,
      enum: ['PENDING', 'QUEUED', 'PLAYING', 'PLAYED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

SongRequestSchema.index({ event: 1, status: 1, upvotes: -1 });
SongRequestSchema.index({ event: 1, isPlayed: 1 });

/**
 * GalleryImageSchema
 * Collaborative photo gallery — guests upload, admin moderates.
 *
 * ACCESS:
 * ADMIN   → full CRUD including moderation (remove, approve)
 * SALES   → read + moderation
 * FINANCE → no access
 * GRE     → read
 * GUEST   → create via public RSVP/gallery link
 *
 * AI MODERATION:
 * On upload, call Cloudinary AI moderation or Featherless.ai vision.
 * If flagged → isAiFlagged = true, status = PENDING_REVIEW.
 * Admin sees flagged images in a separate queue.
 */
const GalleryImageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    uploadedBy: {
      // If guest uploaded
      guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
      guestName: { type: String, default: 'Guest' },
      // If staff uploaded
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // Cloudinary details
    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: String,

    caption: {
      type: String,
      maxlength: 300,
    },

    // ── Moderation ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REMOVED'],
      default: 'PENDING_REVIEW',
    },

    // AI moderation result from Cloudinary / Featherless
    isAiFlagged: {
      type: Boolean,
      default: false,
    },

    aiModerationResult: {
      type: mongoose.Schema.Types.Mixed,
      // Raw response from AI moderation API
    },

    aiFlagReason: {
      type: String,
      // e.g. "potentially inappropriate content", "irrelevant image"
    },

    // Manual moderation
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    moderatedAt: Date,

    moderationNote: String,

    // Engagement
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ event: 1, status: 1, createdAt: -1 });
GalleryImageSchema.index({ event: 1, isAiFlagged: 1 });

export const GalleryImage = mongoose.model('GalleryImage', GalleryImageSchema);
export const SongRequest = mongoose.model('SongRequest', SongRequestSchema);
