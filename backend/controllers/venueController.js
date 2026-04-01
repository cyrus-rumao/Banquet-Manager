import Venue from '../models/venueModel.js';

/**
 * 📦 GET ALL VENUES
 */
export const getVenues = async (req, res) => {
	try {
		const venues = await Venue.find().sort({ createdAt: -1 });
		res.json(venues);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to fetch venues' });
	}
};

/**
 * 🧾 CREATE VENUE
 */
export const createVenue = async (req, res) => {
	try {
		const { hall, location, capacity } = req.body;

		if (!hall) {
			return res.status(400).json({ message: 'Hall is required' });
		}

		const venue = await Venue.create({
			hall,
			location,
			capacity,
		});

		res.status(201).json(venue);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to create venue' });
	}
};

/**
 * ✏️ UPDATE VENUE
 */
export const updateVenue = async (req, res) => {
	try {
		const { id } = req.params;

		const venue = await Venue.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!venue) {
			return res.status(404).json({ message: 'Venue not found' });
		}

		res.json(venue);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to update venue' });
	}
};

/**
 * ❌ DELETE VENUE
 */
export const deleteVenue = async (req, res) => {
	try {
		const { id } = req.params;

		const venue = await Venue.findByIdAndDelete(id);

		if (!venue) {
			return res.status(404).json({ message: 'Venue not found' });
		}

		res.json({ message: 'Venue deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete venue' });
	}
};
