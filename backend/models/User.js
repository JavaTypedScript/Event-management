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
},{timestamps:true});


module.exports = mongoose.model('User',userSchema);