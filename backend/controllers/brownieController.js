import {GalleryImage} from '../models/brownieModel.js';
import { v2 as cloudinary } from 'cloudinary';

export const uploadImage = async (req, res) => {
	try {
		const { eventId, caption, guestName } = req.body;

		if (!req.file) {
			return res.status(400).json({ message: 'No image uploaded' });
		}

		// upload to cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: `events/${eventId}`,
		});

		// 🔥 BASIC AI FLAG (you can replace later)
		let isAiFlagged = false;
		let aiFlagReason = null;

		if (caption && caption.toLowerCase().includes('spam')) {
			isAiFlagged = true;
			aiFlagReason = 'Suspicious caption';
		}

		const image = await GalleryImage.create({
			event: eventId,
			uploadedBy: {
				guestName: guestName || 'Guest',
				user: req.user?._id || null,
			},
			cloudinaryPublicId: result.public_id,
			imageUrl: result.secure_url,
			thumbnailUrl: result.secure_url,
			caption,
			isAiFlagged,
			aiFlagReason,
			status: isAiFlagged ? 'PENDING_REVIEW' : 'APPROVED',
		});

		res.status(201).json(image);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Upload failed' });
	}
};

export const getGalleryByEvent = async (req, res) => {
	try {
		const { eventId } = req.params;

		const images = await GalleryImage.find({
			event: eventId,
			status: 'APPROVED',
		}).sort({ createdAt: -1 });

		res.json(images);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to fetch gallery' });
	}
};

export const getAdminGallery = async (req, res) => {
	try {
		const { eventId } = req.params;

		const images = await GalleryImage.find({
			event: eventId,
		}).sort({ createdAt: -1 });

		res.json(images);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to fetch admin gallery' });
	}
};

export const approveImage = async (req, res) => {
	try {
		const { id } = req.params;

		const image = await GalleryImage.findByIdAndUpdate(
			id,
			{
				status: 'APPROVED',
				moderatedBy: req.user._id,
				moderatedAt: new Date(),
			},
			{ new: true },
		);

		if (!image) {
			return res.status(404).json({ message: 'Image not found' });
		}

		res.json(image);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to approve image' });
	}
};

export const deleteImage = async (req, res) => {
	try {
		const { id } = req.params;

		const image = await GalleryImage.findById(id);

		if (!image) {
			return res.status(404).json({ message: 'Image not found' });
		}

		await cloudinary.uploader.destroy(image.cloudinaryPublicId);

		await image.deleteOne();

		res.json({ message: 'Image deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete image' });
	}
};