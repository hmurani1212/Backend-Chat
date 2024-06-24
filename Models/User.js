const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }]
});
module.exports = mongoose.model('User', userSchema);