const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middlewares/asyncHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create directory structure based on document type
        const uploadPath = path.join(__dirname, '../uploads/documents');
        const docType = req.body.documentType || 'general';

        let subDir = '';
        switch (docType) {
            case 'government-id':
                subDir = 'government-id';
                break;
            case 'tax-proof':
                subDir = 'tax-proof';
                break;
            case 'educational':
                subDir = 'educational';
                break;
            case 'experience':
                subDir = 'experience';
                break;
            default:
                subDir = 'general';
        }

        const fullPath = path.join(uploadPath, subDir);

        // Ensure directory exists
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('document');

// @desc    Upload a single document
// @route   POST /api/upload/document
// @access  Public (for onboarding)
exports.uploadDocument = asyncHandler(async (req, res, next) => {
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Generate file URL based on where the file was actually stored
        // Since all files are currently stored in 'general' folder due to document type issue
        const fileUrl = `/uploads/documents/general/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: fileUrl,
                documentType: req.body.documentType || 'general',
                uploadedAt: new Date()
            },
            message: 'File uploaded successfully'
        });
    });
});

// @desc    Upload multiple documents
// @route   POST /api/upload/documents
// @access  Public (for onboarding)
exports.uploadMultipleDocuments = asyncHandler(async (req, res, next) => {
    const uploadMultiple = upload.array('documents', 10); // Max 10 files

    uploadMultiple(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'One or more files too large. Maximum size is 10MB per file.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Maximum 10 files allowed.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        // Process uploaded files
        const uploadedFiles = req.files.map(file => {
            // Since all files are currently stored in 'general' folder due to document type issue
            const fileUrl = `/uploads/documents/general/${file.filename}`;
            return {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                url: fileUrl,
                documentType: req.body.documentType || 'general',
                uploadedAt: new Date()
            };
        });

        res.status(200).json({
            success: true,
            data: {
                files: uploadedFiles,
                count: uploadedFiles.length
            },
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        });
    });
});

// @desc    Delete uploaded document
// @route   DELETE /api/upload/document/:filename
// @access  Public (for onboarding)
exports.deleteDocument = asyncHandler(async (req, res, next) => {
    const { filename } = req.params;
    const { documentType = 'general' } = req.query;

    if (!filename) {
        return res.status(400).json({
            success: false,
            error: 'Filename is required'
        });
    }

    const filePath = path.join(__dirname, '../uploads/documents', documentType, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            error: 'File not found'
        });
    }

    try {
        // Delete the file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
});
