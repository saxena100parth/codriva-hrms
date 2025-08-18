const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Holiday = require('../models/Holiday');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public for authenticated users to view
router.get('/', auth, async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({ holidays });
  } catch (error) {
    console.error('List holidays error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR/Admin: create holiday
router.post('/', auth, authorize('hr', 'admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').optional().isString(),
  body('isOptional').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const holiday = new Holiday(req.body);
    await holiday.save();
    res.status(201).json({ message: 'Holiday created', holiday });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Holiday for this date already exists' });
    }
    console.error('Create holiday error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR/Admin: update holiday
router.put('/:id', auth, authorize('hr', 'admin'), [
  param('id').isMongoId(),
  body('name').optional().notEmpty(),
  body('date').optional().isISO8601(),
  body('description').optional().isString(),
  body('isOptional').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Holiday updated', holiday });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HR/Admin: delete holiday
router.delete('/:id', auth, authorize('hr', 'admin'), [param('id').isMongoId()], async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Holiday deleted' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


