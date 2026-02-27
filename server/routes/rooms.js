const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, language } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const roomId = uuidv4().substring(0, 8);

    const room = await Room.create({
      roomId,
      name,
      language: language || 'javascript',
      owner: req.userId,
      participants: [req.userId],
    });

    await room.populate('owner', 'username email avatar');

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error creating room.' });
  }
});

// @route   GET /api/rooms
// @desc    Get all rooms for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ owner: req.userId }, { participants: req.userId }],
      isActive: true,
    })
      .populate('owner', 'username email avatar')
      .populate('participants', 'username email avatar')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error fetching rooms.' });
  }
});

// @route   GET /api/rooms/:roomId
// @desc    Get a specific room by roomId
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true })
      .populate('owner', 'username email avatar')
      .populate('participants', 'username email avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Add user to participants if not already present
    if (!room.participants.some((p) => p._id.toString() === req.userId.toString())) {
      room.participants.push(req.userId);
      await room.save();
      await room.populate('participants', 'username email avatar');
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error fetching room.' });
  }
});

// @route   DELETE /api/rooms/:roomId
// @desc    Delete a room (soft delete)
// @access  Private (owner only)
router.delete('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    if (room.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the room owner can delete the room.' });
    }

    room.isActive = false;
    await room.save();

    res.json({ message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error deleting room.' });
  }
});

module.exports = router;
