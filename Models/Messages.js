const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  Message: {
    type: String,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  image: {
    type: String,
     // Store URL or path of the uploaded image
    required: false // Make sure this field is not required if message can be sent without an image
  }
});

const Messages = mongoose.model('Messages', messageSchema);

module.exports = Messages;
