import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

/**
 * ROLES:
 * ADMIN   → full access to everything
 * SALES   → create/view events, inquiries, menus
 * FINANCE → view all events, manage payments, confirm bookings
 * GRE     → view today's events, scan QR, manage guest check-ins
 */

const ROLES = ['ADMIN', 'SALES', 'FINANCE', 'GRE', 'USER'];

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
		},

		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
		},

		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: 6,
			// select: false, // never returned in queries by default
		},

		role: {
			type: String,
			enum: ROLES,
			required: true,
			default: 'USER',
		},

		phone: {
			type: String,
			trim: true,
		},

		isActive: {
			type: Boolean,
			default: true,
		},

		// Track last login for audit purposes
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true, // createdAt, updatedAt
	},
);

UserSchema.statics.ROLES = ROLES;

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
