import Event from '../models/eventModel.js';
import { Menu } from '../models/menuModel.js';
import User from '../models/userModel.js'; // Import User model to find GREs
import Payment from '../models/paymentModel.js';
/**
 * 🔥 CHECK CONFLICT
 * Used in Step 1 before proceeding
 */
export const checkConflict = async (req, res) => {
	try {
		const { venue, startDateTime, endDateTime } = req.body;

		if (!venue || !startDateTime || !endDateTime) {
			return res.status(400).json({ message: 'Missing fields' });
		}

		const conflict = await Event.findOne({
			venue,
			status: { $in: ['BOOKED', 'IN_PROGRESS'] },
			$or: [
				{
					'schedule.startDateTime': { $lt: new Date(endDateTime) },
					'schedule.endDateTime': { $gt: new Date(startDateTime) },
				},
			],
		});

		if (conflict) {
			return res.status(400).json({
				message: 'Venue already booked for this time slot',
			});
		}

		res.json({ ok: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * 🧾 CREATE EVENT
 */
// import Event from '../models/eventModel.js';
// import User from '../models/userModel.js'; // Import User model to find GREs

/**
 * 🧾 CREATE EVENT
 */
export const createEvent = async (req, res) => {
	try {
		const { partyName, eventType, venue, schedule, client, headcount } =
			req.body;
		// console.log('Request', req.body);
		if (!partyName || !eventType || !venue || !schedule || !client) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// 1. Find a user with the role GRE to assign as Event Manager
		// In a real app, you might pick a specific one, but for now, let's grab the first one
		const greUser = await User.findOne({ role: 'GRE', isActive: true });
		// console.log('greUser', greUser._id);
		console.log(req)
		if (!greUser) {
			return res.status(404).json({
				message: 'No GRE found in system to assign as Event Manager',
			});
		}

		// 2. Create the event
		const event = await Event.create({
			partyName,
			eventType,
			venue,
			schedule: {
				startDateTime: new Date(schedule.startDateTime),
				endDateTime: new Date(schedule.endDateTime),
			},
			client,
			headcount: {
				expected: headcount?.expected || 1,
			},
			createdBy: req.user._id, // The person who filled the form (Sales/Admin)
			eventManager: greUser._id, // Assigned to the GRE found above
			members: [req.user._id, greUser._id], // Both the creator and manager are members
		});

		return res.status(201).json(event);
	} catch (err) {
		console.error(err);
		res
			.status(500)
			.json({ message: 'Failed to create bruh', error: err.message });
	}
};

/**
 * 📦 GET USER EVENTS
 */
export const getAllEvents = async (req, res) => {
	try {
		const events = await Event.find().populate('venue').sort({ createdAt: -1 });
		console.log(events);
		res.json(events);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to fetch events' });
	}
};

export const getMyEvents = async (req, res) => {
	try {
		const events = await Event.find({
			members: req.user._id,
		})
			.populate('venue')
			.sort({ createdAt: -1 });
		console.log(events);
		res.json(events);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to fetch events' });
	}
};

export const confirmEnquiry = async (req, res) => {
	try {
		const { id } = req.params;
		const { baseTier, selections } = req.body;

		const event = await Event.findById(id);

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		// check if menu already exists
		let menuDoc = await Menu.findOne({ event: id });

		if (menuDoc) {
			menuDoc.baseTier = baseTier;
			menuDoc.selections = selections;
			await menuDoc.save();
		} else {
			menuDoc = await Menu.create({
				event: id,
				baseTier,
				selections,
			});
		}

		event.status = 'ENQUIRY_CONFIRMED';
		event.menuSelection = menuDoc._id;
		await event.save();
		res.json({ message: 'Confirmed with menu', event });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getEventById = async (req, res) => {
	try {
		const { id } = req.params;

		const event = await Event.findById(id)
			.populate('venue')
			.populate('eventManager', 'name email');

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		// 🔥 Fetch payment separately
		const payment = await Payment.findOne({ event: id });
		// console.log(payment)
		res.json({
			...event.toObject(),
			payment, // attach it manually
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};
