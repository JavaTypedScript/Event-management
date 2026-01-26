const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, 
        enum: ['room','lab','equipment','halls'],
        required: true,
    },
    capacity: Number,
    bookings: [{
        event:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        },
        startTime: Date,
        endTime: Date,
        status: {
            type: String,
            enum: ['pending','confirmed'],
            default: 'pending',
        }
    }],
});

module.exports = mongoose.model('Resource',resourceSchema);