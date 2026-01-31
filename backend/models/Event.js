const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title:{type:String,required:true},
    description: String,
    organizer: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
    collaboratros:[{
        type: mongoose.Schema.Types.ObjectId, ref:'User'
    }],
    status:{
        type: String,
        enum: ['draft','pending','approved','rejected','completed'],
        default: 'draft'
    },
    startDate: Date,
    endDate: Date,
    venue:{
        type:mongoose.Schema.Types.ObjectId,ref:'Resource'
    },
    budget: { type: Number, default: 0 },
    visibility: {
        type: String,
        enum: ['public','internal'],
        default: 'public',
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hostingClub: { type: String },
    
},{ timestamps: true });

module.exports = mongoose.model('Event',eventSchema);