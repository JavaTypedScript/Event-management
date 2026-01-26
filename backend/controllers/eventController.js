const Event = require('../models/Event');
const Resource = require('../models/Resource');

// @desc Create new event
// @route POST /api/events
// @access Organizer/Admin
const createEvent = async (req,res) =>{
    try {
        const {title,description,startDate,endDate,venueId,budget} = req.body;
        if(venueId){
            const resource = await Resource.findById(venueId);
            const conflict = resource.bookings.some(b => (new Date(startDate) < b.endTime && new Date(endTime) > b.startTime) 
            && b.status == 'confirmed');
            if(conflict) {
                return res.status(400).json({
                    message: 'Resource already booked for this time slot'
                });
            }
        }
        const event = await Event.create({
            title,
            description,
            organizer: req.user._id,
            startDate,
            endDate,
            venue: venueId,
            budget,
            status:'pending'
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({
            message:error.message
        });
    }
}

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

module.exports = {createEvent,approveEvent};