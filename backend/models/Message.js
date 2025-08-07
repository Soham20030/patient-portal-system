import { query } from '../config/database.js';

class Message {
  // Send a new message
  static async create(data) {
    const { sender_id, recipient_id, subject, message } = data;
    try {
      const queryText = `
        INSERT INTO messages (sender_id, recipient_id, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [sender_id, recipient_id, subject || null, message];
      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  // Get message by ID
  static async findById(id) {
    try {
      const queryText = `SELECT * FROM messages WHERE id = $1`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding message: ${error.message}`);
    }
  }

  // Get inbox messages for a user (recipient)
  static async findInboxByUser(user_id, options = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    let queryText = `
      SELECT * FROM messages
      WHERE recipient_id = $1
    `;
    if (unreadOnly) {
      queryText += ` AND is_read = false`;
    }
    queryText += ` ORDER BY sent_at DESC LIMIT $2 OFFSET $3`;

    try {
      const result = await query(queryText, [user_id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching inbox messages: ${error.message}`);
    }
  }

  // Get outbox messages for a user (sender)
  static async findOutboxByUser(user_id, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const queryText = `
      SELECT * FROM messages
      WHERE sender_id = $1
      ORDER BY sent_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await query(queryText, [user_id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching outbox messages: ${error.message}`);
    }
  }

  // Mark a message as read
  static async markAsRead(id) {
    try {
      const queryText = `
        UPDATE messages
        SET is_read = true
        WHERE id = $1
        RETURNING *
      `;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  // Delete a message by ID
  static async delete(id) {
    try {
      const queryText = `DELETE FROM messages WHERE id = $1 RETURNING *`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }
  
  // Basic validation for create message input
  static validateMessageData(data) {
    const errors = [];
    if (!data.sender_id) errors.push('sender_id is required');
    if (!data.recipient_id) errors.push('recipient_id is required');
    if (!data.message) errors.push('message content is required');
    return errors;
  }
}

export default Message;
