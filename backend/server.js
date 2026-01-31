require('dotenv').config()

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // List of explicitly allowed domains
    const allowedOrigins = [
      "http://localhost:5173",
      "https://event-management-eventify.vercel.app", // Your MAIN production URL (Check Vercel Dashboard for exact name)
    ];

    // Check if origin is in the allowed list OR if it matches a Vercel preview URL
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routers/authRoutes'));
app.use('/api/events', require('./routers/eventRoutes'));
app.use('/api/resources', require('./routers/resourceRoutes'));
app.use('/api/chat', require('./routers/chatRoutes'));
app.use('/api/analytics', require('./routers/analyticsRoutes'));
app.use('/api/clubs', require('./routers/clubRoutes'));

const allowedOrigins = [
      "http://localhost:5173",
      "https://event-management-eventify.vercel.app", // Your MAIN production URL (Check Vercel Dashboard for exact name)
];

// socket.io
const io = new Server(server,{
    cors:{
        origin:allowedOrigins,
        methods:["GET","POST"],
    }
});

io.on('connection',(socket)=>{
    console.log(`User Connected:${socket.id}`);

    socket.on('join_room',(room)=>{
        socket.join(room);
    });

    socket.on('join_chat',(chat)=>{
        socket.join(chat);
        console.log(`User joined room: ${chat}`);
    });

    socket.on('new_message', async (newMessageReceived) => {
        const {conversationId,senderId,text} = newMessageReceived;

        const Message = require('./models/Message');
        const Conversation = require('./models/Conversation');

            try {
                const savedMsg = await Message.create({
                    conversationId,
                    sender: senderId,
                    text
                });

                await Conversation.findByIdAndUpdate(conversationId,{
                    lastMessage: text,
                    lastMessageAt: Date.now()
                });

                socket.to(conversationId).emit("message_received", savedMsg);

            } catch (error) {
                console.error(error);
            }
    })

    socket.on('send_message',(message)=>{
        socket.to(message.room).emit('receive_message',message);
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`);
})