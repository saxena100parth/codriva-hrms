const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const Ticket = require('../models/Ticket');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee: create ticket
router.post('/', auth, authorize('employee', 'hr', 'admin'), [
  body('subject').isLength({ min: 3, max: 200 }).withMessage('Subject length invalid'),
  body('description').isLength({ min: 5 }).withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = new Ticket({
      createdBy: req.user._id,
      subject: req.body.subject,
      description: req.body.description
    });
    await ticket.save();
    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: view own tickets; HR/Admin: view all or by user
router.get('/', auth, [
  query('userId').optional().isMongoId(),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'rejected']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user.role === 'employee') {
      filter.createdBy = req.user._id;
    } else if (req.query.userId) {
      filter.createdBy = req.query.userId;
    }
    if (req.query.status) filter.status = req.query.status;

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('List tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR/Admin: change status (approve/reject is interpreted as resolved/rejected)
router.patch('/:id/status', auth, authorize('hr', 'admin'), [
  param('id').isMongoId(),
  body('status').isIn(['in_progress', 'resolved', 'rejected']),
  body('comment').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = req.body.status;
    ticket.assignedTo = req.user._id;
    ticket.decisionAt = new Date();
    ticket.decisionComment = req.body.comment || '';
    await ticket.save();

    res.json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


