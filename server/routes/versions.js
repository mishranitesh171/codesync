const express = require('express');
const Version = require('../models/Version');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/versions/:roomId
// @desc    Save a code snapshot/version
// @access  Private
router.post('/:roomId', auth, async (req, res) => {
  try {
    const { code, language, label } = req.body;
    const { roomId } = req.params;

    // Verify room exists
    const room = await Room.findOne({ roomId, isActive: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Count existing versions for this room
    const versionCount = await Version.countDocuments({ roomId });

    const version = await Version.create({
      roomId,
      code,
      language: language || room.language,
      label: label || `Version ${versionCount + 1}`,
      savedBy: req.userId,
    });

    await version.populate('savedBy', 'username avatar');

    res.status(201).json(version);
  } catch (error) {
    console.error('Save version error:', error);
    res.status(500).json({ message: 'Server error saving version.' });
  }
});

// @route   GET /api/versions/:roomId
// @desc    Get all versions for a room
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
  try {
    const versions = await Version.find({ roomId: req.params.roomId })
      .populate('savedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error fetching versions.' });
  }
});

// @route   GET /api/versions/:roomId/:versionId
// @desc    Get a specific version
// @access  Private
router.get('/:roomId/:versionId', auth, async (req, res) => {
  try {
    const version = await Version.findById(req.params.versionId)
      .populate('savedBy', 'username avatar');

    if (!version || version.roomId !== req.params.roomId) {
      return res.status(404).json({ message: 'Version not found.' });
    }

    res.json(version);
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ message: 'Server error fetching version.' });
  }
});

module.exports = router;
