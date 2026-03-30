import Guest from '../models/guestModel.js';

// GET /api/guests?eventId=xxx
export const getGuestsByEvent = async (req, res) => {
  try {
    console.log("Collection Name", Guest.collection.name);
    const { eventId } = req.query;
    console.log("Fetching guests for eventId:", eventId);
    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const guests = await Guest.find({ event : eventId });
    console.log(guests);
    res.status(200).json({
      success: true,
      count: guests.length,
      data: guests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// PATCH /api/guests/:id/arrive
export const markGuestArrived = async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await Guest.findById(id);

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Update fields
    guest.rsvpStatus = 'ARRIVED';
    guest.rsvpConfirmedAt = new Date();

    await guest.save();

    res.status(200).json({
      success: true,
      message: "Guest marked as ARRIVED",
      data: guest,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};