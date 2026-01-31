const Resource = require('../models/Resource');

// @desc Get all resources
const getAllResources = async (req,res) => {
    try {
        const resources = await Resource.find({});
        res.json(resources);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

// @desc Check if the slot is free
const checkAvailabilty = async(req,res) => {
    const {resourceId,startTime,endTime} = req.body;
    try {
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        const conflict = await Resource.findOne({
            _id:resourceId,
            bookings:{
                $eleMatch:{
                    status:{$in:['confirmed','pending']},
                    startTime: {$lt:newEnd},
                    endTime: {$gt:newStart}
                }
            }
        });

        if(conflict){
            return res.status(409).json({
                message:'Conflict detected'
            })
        }
        res.status(200).json({message:'Available'})
    } catch (error) {
        res.status(500).json({error:error.message});
    }
};

// @desc Book a resource (Atomic)
const bookResource = async (req,res) => {
    const {resourceId,eventId,startTime,endTime} = req.body;
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    try {
        const resource = await Resource.findOneAndUpdate(
        {
            _id:resourceId,
            bookings:{
                $not:{
                    $eleMatch:{
                        status:{
                            $in:['confirmed','pending']
                        },
                        startTime:{$lt:newEnd},
                        endTime:{$gt:newStart},
                    }
                }
            }
        },
        {
            $push:{
                bookings:{
                    event:eventId,
                    startTime: newStart,
                    endTime:newEnd,
                    status:'confirmed'
                }
            }
        },
        {new:true},
    );

    if(!resource) {
        return res.status(409).json({message:'Booking failed: Slot taken.'});
    }
    res.json(resource);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

const hasConflict = async(resourceId,instances) => {
    for(const instance of instances) {
        const conflict = await Resource.findOne({
            _id:resourceId,
            bookings:{
                $eleMatch:{
                    startTime:{$lt:instance.end},
                    endTime:{$gt:instance.start},
                }
            }
        });
        if(conflict){
            return true;
        }
        return false;
    }
}

module.exports = {getAllResources,checkAvailabilty,bookResource,hasConflict};