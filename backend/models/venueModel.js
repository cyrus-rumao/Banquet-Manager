import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema(
	{
		hall: {
			type: String,
			required: true,
			trim: true,
		},
		location: {
			type: String,
			trim: true,
		},
		capacity: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

const Venue = mongoose.model('Venue', VenueSchema);

export default Venue;
