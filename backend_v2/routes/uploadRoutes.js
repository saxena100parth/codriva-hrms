const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    uploadMultipleDocuments,
    deleteDocument
} = require('../controllers/uploadController');

// @route   POST /api/upload/document
// @desc    Upload a single document
// @access  Public (for onboarding)
router.post('/document', uploadDocument);

// @route   POST /api/upload/documents
// @desc    Upload multiple documents
// @access  Public (for onboarding)
router.post('/documents', uploadMultipleDocuments);

// @route   DELETE /api/upload/document/:filename
// @desc    Delete uploaded document
// @access  Public (for onboarding)
router.delete('/document/:filename', deleteDocument);

module.exports = router;
