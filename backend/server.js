require('dotenv').config()

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["https://campus-events.vercel.app", "http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routers/authRoutes'));
app.use('/api/events', require('./routers/eventRoutes'));
app.use('/api/resources', require('./routers/resourceRoutes'));
app.use('/api/chat', require('./routers/chatRoutes'));
app.use('/api/analytics', require('./routers/analyticsRoutes'));
app.use('/api/clubs', require('./routers/clubRoutes'));


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