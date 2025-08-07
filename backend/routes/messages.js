import express from 'express';
import * as MessageController from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';  // Your existing auth middleware

const router = express.Router();

router.use(authMiddleware);

// Static routes should come first
router.get('/inbox', MessageController.getInboxMessages);
router.get('/outbox', MessageController.getOutboxMessages);

router.get('/:id', MessageController.getMessageById);
router.post('/', MessageController.createMessage);
router.put('/:id/read', MessageController.markMessageAsRead);
router.delete('/:id', MessageController.deleteMessage);

export default router;
