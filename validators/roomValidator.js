const Joi = require('joi');

const roomSchema = Joi.object({
    roomName: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Room name cannot be empty',
        'any.required': 'Room name is required'
    })
});

module.exports = { roomSchema };
