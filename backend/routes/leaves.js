const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee: list own leaves; HR/Admin: filter by user
router.get('/', auth, [
  query('userId').optional().isMongoId().withMessage('Invalid userId'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
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
      filter.userId = req.user._id;
    } else if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.status) filter.status = req.query.status;

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Leave.countDocuments(filter);

    res.json({
      leaves,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('List leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: apply leave
router.post('/', auth, authorize('employee', 'hr', 'admin'), [
  body('type').isIn(['sick', 'casual', 'earned', 'unpaid', 'other']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid startDate'),
  body('endDate').isISO8601().withMessage('Invalid endDate'),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, startDate, endDate, reason } = req.body;
    const leave = new Leave({
      userId: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });
    await leave.save();
    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR/Admin: approve or reject leave
router.patch('/:id/status', auth, authorize('hr', 'admin'), [
  param('id').isMongoId().withMessage('Invalid id'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('comment').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = req.body.status;
    leave.approverId = req.user._id;
    leave.approvalComment = req.body.comment || '';
    leave.decisionAt = new Date();
    await leave.save();

    res.json({ message: 'Leave status updated', leave });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


