import Message from '../models/Message.js';

// Send a new message
export const createMessage = async (req, res) => {
  const errors = Message.validateMessageData(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get message by ID
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inbox messages for the current user (recipient)
export const getInboxMessages = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is available from auth middleware
  const { limit, offset, unreadOnly } = req.query;

  try {
    const messages = await Message.findInboxByUser(userId, {
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get outbox messages for the current user (sender)
export const getOutboxMessages = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is available from auth middleware
  const { limit, offset } = req.query;

  try {
    const messages = await Message.findOutboxByUser(userId, {
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.markAsRead(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a message by ID
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.delete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted successfully.', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
