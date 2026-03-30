import mongoose from "mongoose";

const VenueSchema = new mongoose.Schema(
  {
    venue: {
      hall: {
        type: String,
        required: true,
        trim: true,
        // e.g. "Banquet Hall A", "Rooftop Terrace", "Garden Lawn"
      },
      location: {
        type: String,
        trim: true, // full address or description
      },
    },
  }
);

// Export the model
const Venue = mongoose.model("Venue", VenueSchema);

export default Venue;