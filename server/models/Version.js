const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
    maxlength: [200, 'Label cannot exceed 200 characters'],
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying by room
versionSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Version', versionSchema);
