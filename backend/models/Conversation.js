const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  
  // --- NEW FIELDS ---
  isGroup: { type: Boolean, default: false },
  chatName: { type: String, trim: true }, // For Event Title
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } // Links to the Event
  // ------------------
  
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);