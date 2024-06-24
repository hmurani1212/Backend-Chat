const express = require('express');
const router = express.Router();
const Room = require('../Models/Rooms');
const Messages = require('../Models/Messages');
const User = require('../Models/User');
const { io } = require('../index');
const fetchUser = require("../middleware/fetchUser");
const upload = require('../MulterSetup/Multer');
const Notification = require('../Models/Notification');

router.get('/getAllmessage', async function (req, res) {
    try {
        const allMessages = await Messages.find();
        res.send(allMessages)
    } catch (err) {
        console.log(err);
    }
})

// End Point to Create a ChatRoom http://localhost:400/p1/v1/createRoom
router.post('/createRoom', async function (req, res) {
    const { roomName, userIds } = req.body; // Expecting userIds as an array of user IDs
    try {
        const room = new Room({ roomName, users: userIds || [] }); // Initialize with userIds if provided
        await room.save();
        res.send(room);
    } catch (error) {
        res.status(403).json({ error });
    }
});


// End Point to Create get ChatRoom http://localhost:400/p1/v1/getRooms
router.get('/getRooms', async function (req, res) {
    try {
        const allGroup = await Room.find();
        if (!allGroup) {
            return res.status(401).send('Room not found');
        }
        res.send(allGroup);
    } catch (error) {
        res.status(403).json({ error });
    }
});

// End Point to get messages http://localhost:400/p1/v1/messages
router.get('/messages', async (req, res) => {
    try {
        const { userId, roomId } = req.query;
        const user = await User.findById(userId);
        if (!user || !user.rooms.includes(roomId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const messages = await Messages.find({ room: roomId });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// End Point to send messages http://localhost:4000/p1/v1/messages
router.post('/messages', upload.single('image'), fetchUser, async (req, res) => {
    const senderId = req.user.id;
    const { Message, room } = req.body;
    let image = '';
    if (req.file) {
        image = req.file.path;
    }
    try {
        // Create and save the new message
        const newMessage = new Messages({ Message, room, senderId, image });
        const savedMessage = await newMessage.save();
        // Fetch all users in the room to send notifications
        const roomData = await Room.findById(room).populate('users');
        if (!roomData) {
            return res.status(404).json({ error: 'Room not found' });
        };
        console.log(roomData);
        // Create notifications for all users in the room except the sender
        const notifications = roomData.users
            .filter(user => user._id.toString() !== senderId) // Exclude sender
            .map(user => ({
                notification: 'A user sent you a message',
                user: user._id,
                type: 'message'
            }));

        // Save notifications to the database
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        // Emit events to the room
        io.to(room).emit('chat-message', savedMessage);
        io.to(room).emit('new-notification', notifications);
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message', details: error });
    }
});
// End Point to add the user in Chat http://localhost:400/p1/v1/addUser
router.post('/addUser', async function (req, res) {
    try {
        const { userId, roomId } = req.body;
        const user = await User.findById(userId);
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(401).send('Room not found');
        }
        if (!user) {
            return res.status(401).send('User not found');
        }
        
        // Check if the user is already in the room
        if (!room.users.some(u => u._id.equals(userId))) { // Check if the user ID already exists in the room
            // Push user's name and ID to the room's users array
            room.users.push({ _id: userId, name: user.name });
            await room.save(); // Save the updated room
        }
        
        res.status(200).json({ message: 'User added to room', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



// Endpoint to fetch notifications for a user
router.get('/notifications', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Endpoint to mark a notification as read
router.put('/notifications/:id/read', fetchUser, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

module.exports = router;
