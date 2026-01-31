const Event = require('../models/Event');
const Resource = require('../models/Resource');

// @desc Create new event
// @route POST /api/events
// @access Organizer/Admin
// @desc    Create a new event
// @route   POST /api/events
const createEvent = async (req, res) => {
  const { title, description, startDate, endDate, venueId, visibility, budget } = req.body;

  try {
    // 1. Basic Validation
    if (!title || !startDate || !endDate || !venueId) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 2. CONFLICT CHECK (The Critical Part)
    // We look for any existing event that overlaps with our requested time
    const conflictingEvent = await Event.findOne({
      venue: venueId, // Same venue
      status: { $ne: 'rejected' }, // Ignore rejected events (they don't block the room)
      $or: [
        // Case 1: New event starts during an existing event
        { 
          startDate: { $lt: new Date(endDate) }, 
          endDate: { $gt: new Date(startDate) } 
        }
      ]
    });

    if (conflictingEvent) {
      return res.status(409).json({ 
        message: `Venue is already booked during this time by "${conflictingEvent.title}".` 
      });
    }

    // 3. Create the Event if no conflict
    const event = await Event.create({
  title,
  description,
  startDate,
  endDate,
  venue: venueId,
  visibility,
  budget: budget ? Number(budget) : 0,
  organizer: req.user._id, // The User ID (John)
  hostingClub: req.user.managedClub || "Independent", // <--- THE FIX
  status: 'pending'
});

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve an event
// @route POST /api/events/:id/approve
// @access Admin Only
const approveEvent = async(req,res) => {
    const event = await Event.findById(req.params.id);
    if(!event){
        return res.status(400).json({
            message: 'Event not found'
        })
    }
    event.status='approved'
    await event.save();

    res.json(event);
};

// @desc Get public approved events
// @route   GET/api/events
// @access Public
const getPublicEvents = async(req,res) => {
    try {
        const {search,club,startDate,endDate} = req.query;

        let query = {
            status:'approved',
            visibility:'public',
        }

        if(search){
            query.title = {$regex:search,$options:'i'};
        }

        if(club){
            query.organizer = club;
        }

        if(startDate || endDate){
            query.startDate = {};
            if(startDate) query.startDate.$gte = new Date(startDate);
            if(endDate) query.startDate.$lte = new Date(endDate);
        }

        const events = await Event.find(query)
            .sort({startDate:1})
            .populate('organizer','name department')
            .populate('venue','name');

        res.json(events);

    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

// @desc    Get all pending events (Admin only)
// @route   GET /api/events/pending
const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name email department') // See who asked
      .populate('venue', 'name') // See where
      .sort({ startDate: 1 }); // Urgent events first
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Reject an event
// @route   PUT /api/events/:id/reject
const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'rejected';
    await event.save();
    
    // We should probably release the Resource booking here if we were strict,
    // but our booking logic usually waits for 'confirmed' status anyway.

    res.json({ message: 'Event rejected', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get single event
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email department')
      .populate('venue', 'name')
      .populate('participants', 'name email'); // Optional: Only if you want to show who registered

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register user for event
// @route   POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if already registered
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already registered' });
    }

    // Add user to array
    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getEventById, 
  registerForEvent, 
  createEvent, getPublicEvents, getPendingEvents, approveEvent, rejectEvent 
};

