const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role:{
        type:String,
        enum:['admin','organizer','participant'],
        default: 'participant',
    },
    department: String,
    year: String,
    memberships: [
        {
            clubName: String,
            role: {type:String,enum:['member','lead']}
        }
    ],
    managedClub: { 
    type: String, 
    default: null // e.g., "Robotics Club", "NSS", "Student Council"
  },
  // ... existing fields ...
managedClub: { type: String, default: null }, // Validated Club (Set by Admin)
requestedClub: { type: String, default: null }, // The Club they CLAIM to lead
// ...
},{timestamps:true});


module.exports = mongoose.model('User',userSchema);