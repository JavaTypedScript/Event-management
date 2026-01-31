const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Access Chat (Create or Fetch 1-on-1)
// @route   POST /api/chat
const accessConversation = async (req, res) => {
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).send("UserId param not sent with request");
  }

  // 1. Check if a 1-on-1 chat already exists
  var isChat = await Conversation.find({
    isGroup: false, // <--- CRITICAL FIX: Ignore group chats!
    $and: [
      { participants: { $elemMatch: { $eq: req.user._id } } },
      { participants: { $elemMatch: { $eq: targetUserId } } },
    ],
  })
    .populate("participants", "-password")
    .populate("latestMessage");

  // Populate sender info in the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  // 2. If it exists, return it
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // 3. If not, create a new 1-on-1 chat
    var chatData = {
      // FIX: Do NOT set chatName for DMs. Leave it undefined or null.
      // chatName: "sender", <--- REMOVE THIS LINE
      isGroup: false,
      participants: [req.user._id, targetUserId],
    };

    try {
      const createdChat = await Conversation.create(chatData);
      const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
        "participants",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

const getMessages = async (req,res) => {
    try {
       const messages = await Message.find({conversationId:req.params.chatId})
       .populate('sender','name email') 
       .sort({createdAt: 1});
       res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// @desc    Fetch all chats for a user
// @route   GET /api/chat
const fetchChats = async (req, res) => {
  try {
    const results = await Conversation.find({
      participants: { $elemMatch: { $eq: req.user._id } }
    })
    .populate("participants", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// ... keep getMessages ...
// @desc    Join (or create) a Group Chat for an Event
// @route   POST /api/chat/group/:eventId
const joinEventGroup = async (req, res) => {
  const { eventId } = req.params;

  try {
    // 1. Check if the group chat already exists for this event
    let conversation = await Conversation.findOne({ 
      isGroup: true, 
      eventId: eventId 
    })
    .populate("participants", "-password")
    .populate("latestMessage");

    // 2. If it exists, ensure current user is in the participants list
    if (conversation) {
      const isMember = conversation.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      );

      if (!isMember) {
        conversation.participants.push(req.user._id);
        await conversation.save();
        // Re-populate after adding
        conversation = await Conversation.findById(conversation._id)
          .populate("participants", "-password")
          .populate("latestMessage");
      }
      return res.json(conversation);
    }

    // 3. If NOT exists, create it
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const newGroup = await Conversation.create({
      isGroup: true,
      chatName: `${event.title} - Discussion`,
      eventId: event._id,
      participants: [req.user._id], // Start with just the joiner (others join as they click)
    });

    const fullGroup = await Conversation.findById(newGroup._id)
      .populate("participants", "-password");

    res.status(200).json(fullGroup);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  accessConversation, 
  fetchChats, 
  getMessages,
  joinEventGroup // <--- Export this
};


