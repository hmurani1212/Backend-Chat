const express = require('express');
const path = require('path');
const connectToMongo = require('./Config/db');
const cors = require('cors');
require('dotenv').config();
const Messages = require('./Models/Messages');
const PORT = 4000;
const app = express();
connectToMongo();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, world');
});

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
module.exports.io = io;
app.use('/p1/v1', require('./Routes/Message'));
app.use('/p2/v1', require('./Routes/addUser'));

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join specific room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle new messages
    socket.on('message', (data) => {
        const newMessage = new Messages(data);
        newMessage.save()
            .then(savedMessage => {
                io.to(savedMessage.room).emit('chat-message', savedMessage); // Emit to the specific room
            })
            .catch(err => {
                console.error('Error saving message to MongoDB', err);
            });
    });

    // Load all messages for newly connected user
    Messages.find()
        .then(messages => {
            socket.emit('load-messages', messages);
        })
        .catch(err => {
            console.error('Error loading messages from MongoDB', err);
        });

    // Handle feedback messages
    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

