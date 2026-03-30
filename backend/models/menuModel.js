import mongoose from 'mongoose';
import { MENU_TIERS } from '../consts/menuOptions.js';

const MenuItemSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		category: {
			type: String,
			enum: [
				'Starter',
				'Main Course',
				'Dessert',
				'Beverage',
				'Live Counter',
				'Snacks',
				'Breads',
				'Rice & Biryani',
				'Other',
			],
			required: true,
		},
		isJain: { type: Boolean, default: false, required: true },
		selectionCount: { type: Number, default: 0, required: true },
	},
	{
		timestamps: true,
		collection: 'MenuItem', // Forces the collection name to 'MenuItem'
	},
);

const MenuSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
			required: true,
		},
		baseTier: {
			type: String,
			enum: ['Standard', 'Premium', 'Elite'],
			required: true,
		},
		selections: {
			Starter: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
			'Main Course': [
				{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
			],
			Breads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
			'Rice & Biryani': [
				{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
			],
			Dessert: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
			Beverage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
			'Live Counter': [
				{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
			],
			Snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
			Other: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
		},
		cuisine: { type: String },
		prepTime: { type: Number },
	},
	{
		timestamps: true,
		collection: 'Menu',
		strictPopulate: false, // Forces the collection name to 'Menu'
	},
);

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
export const Menu = mongoose.model('Menu', MenuSchema);
