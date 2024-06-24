const express = require('express');
const mongoose = require('mongoose');
const User = require("../Models/User");
var jwt = require('jsonwebtoken');
const Room = require('../Models/Rooms')
const jwt_Secret = "HassaisGoodBy";
const router = express.Router();
// End Point  to Create a User  http://localhost:4000/p2/v1/createUser
router.post("/createUser", async function (req, res) {
    try {
        const user = new User(req.body);
        await user.save();
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, jwt_Secret);
        res.status(200).json({user, authToken});
    } catch (error) {
        console.log(error)
    }
});
// End Point  to get All the User  http/:localhost:400/p2/v1/getUser
router.get("/getUser", async function (req, res) {
    try {
        const user = await User.find();
        if (!user) {
            return res.status(404).json({ message: "Users not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});
// Change this to a POST request
router.post('/getUserById', async function(req, res) {
    const { roomId } = req.body;
    try {
        // Fetch the room by ID
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        // Get the user IDs from the room's users array
        const idsArray = room.users;

        // Find users with matching IDs
        const users = await User.find({ _id: { $in: idsArray } });

        res.status(200).json(users); // Return array of users
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server Error' }); // Return error response
    }
});

module.exports = router;
    

                             // Code End