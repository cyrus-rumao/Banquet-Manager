import { MenuItem } from '../models/menuModel.js';
import { Menu } from '../models/menuModel.js';
import { MENU_TIERS } from '../consts/menuOptions.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a single menu item to the catalogue
// @route   POST /api/menu/items
// @access  ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const addMenuItem = async (req, res) => {
	try {
		const { name, category, isJain, selectionCount } = req.body;

		// ── Validate required fields ──────────────────────────────────────────
		if (!name || !category) {
			return res.status(400).json({
				success: false,
				message: 'name and category are required.',
			});
		}

		const VALID_CATEGORIES = [
			'Starter',
			'Main Course',
			'Dessert',
			'Beverage',
			'Live Counter',
			'Snacks',
			'Breads',
			'Rice & Biryani',
			'Other',
		];

		if (!VALID_CATEGORIES.includes(category)) {
			return res.status(400).json({
				success: false,
				message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
			});
		}

		// ── Prevent duplicate item names (case-insensitive) ───────────────────
		const existing = await MenuItem.findOne({
			name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
		});

		if (existing) {
			return res.status(409).json({
				success: false,
				message: `A menu item named "${existing.name}" already exists.`,
			});
		}

		// ── Create ────────────────────────────────────────────────────────────
		const menuItem = await MenuItem.create({
			name: name.trim(),
			category,
			isJain: isJain ?? false,
			selectionCount: selectionCount ?? 0,
		});

		return res.status(201).json({
			success: true,
			message: 'Menu item added successfully.',
			data: menuItem,
		});
	} catch (error) {
		// Mongoose validation errors
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((e) => e.message);
			return res
				.status(400)
				.json({ success: false, message: messages.join('. ') });
		}

		console.error('[addMenuItem]', error);
		return res.status(500).json({ success: false, message: 'Server error.' });
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a menu for an event
// @route   POST /api/menu
// @access  ADMIN, SALES (only while event is TEMPORARY_ENQUIRY or ENQUIRY_CONFIRMED)
// ─────────────────────────────────────────────────────────────────────────────
export const addMenu = async (req, res) => {
	try {
		const { event, baseTier, selections } = req.body;

		// 1. Basic Validation
		if (!event || !baseTier || !selections) {
			return res
				.status(400)
				.json({ success: false, message: 'Missing required fields.' });
		}

		const tierData = MENU_TIERS[baseTier];
		if (!tierData) {
			return res.status(400).json({ success: false, message: 'Invalid tier.' });
		}

		// 2. Prevent Duplicate Menu
		const existingMenu = await Menu.findOne({ event }).lean();
		if (existingMenu) {
			return res.status(409).json({
				success: false,
				message: 'Menu already exists.',
				menuId: existingMenu._id,
			});
		}

		// 3. Optimized Validation (One single DB call instead of many)
		const allSelectedIds = Object.values(selections).flat();
		const limits = tierData.limits;

		// Check Limits First (Synchronous - Fast)
		for (const category in limits) {
			const count = selections[category]?.length || 0;
			if (count > limits[category]) {
				return res.status(400).json({
					success: false,
					message: `${category} exceeds limit of ${limits[category]}`,
				});
			}
		}

		// Single DB call to verify all IDs and Categories at once
		const dbItems = await MenuItem.find({ _id: { $in: allSelectedIds } })
			.select('category')
			.lean();

		if (dbItems.length !== allSelectedIds.length) {
			return res
				.status(404)
				.json({ success: false, message: 'One or more Item IDs are invalid.' });
		}

		// Validate Category Mismatch (Fast - done in memory)
		for (const item of dbItems) {
			const expectedCategory = Object.keys(selections).find((cat) =>
				selections[cat].includes(item._id.toString()),
			);
			if (item.category !== expectedCategory) {
				return res.status(400).json({
					success: false,
					message: `Item ${item._id} belongs to ${item.category}, not ${expectedCategory}`,
				});
			}
		}

		// 4. Create the Menu
		const menu = await Menu.create({ event, baseTier, selections });

		// 5. Fixed Population (Correct way to handle paths with spaces)
		const populated = await Menu.findById(menu._id).populate([
			{ path: 'selections.Starter' },
			{ path: 'selections.Main Course' }, // Mongoose handles the space correctly in 'path' string
			{ path: 'selections.Breads' },
			{ path: 'selections.Rice & Biryani' },
			{ path: 'selections.Dessert' },
			{ path: 'selections.Beverage' },
			{ path: 'selections.Live Counter' },
			{ path: 'selections.Snacks' },
			{ path: 'selections.Other' },
		]);

		return res.status(201).json({ success: true, data: populated });
	} catch (error) {
		console.error('CRITICAL ERROR:', error); // DO NOT COMMENT THIS OUT
		if (!res.headersSent) {
			return res.status(500).json({ success: false, message: error.message });
		}
	}
};

export const getMenu = async (req, res) => {
	try {
		const { category, group } = req.query;
		let query = {};

		// Filter by category if provided (e.g., /api/menu/items?category=Starter)
		if (category) {
			query.category = category;
		}

		const items = await MenuItem.find(query).sort({ selectionCount: -1 });

		// If 'group=true' is passed, organize items by category for the frontend tabs
		if (group === 'true') {
			const grouped = items.reduce((acc, item) => {
				if (!acc[item.category]) acc[item.category] = [];
				acc[item.category].push(item);
				return acc;
			}, {});
			return res.status(200).json(grouped);
		}

		res.status(200).json(items);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error fetching menu items', error: error.message });
	}
};
export const getAllMenuItems = async (req, res) => {
	console.log('1. Route Hit');
	try {
		console.log('2. Attempting DB Find...');

		// Using .lean() makes it faster and avoids Mongoose magic
		const items = await MenuItem.find({}).lean();

		console.log('3. Items found:', items.length);
		return res.status(200).json(items);
	} catch (error) {
		console.log('4. Error caught:', error.message);
		return res.status(500).json({ error: error.message });
	}
};
export const MenuConfirm = async (req, res) => { 
	
}