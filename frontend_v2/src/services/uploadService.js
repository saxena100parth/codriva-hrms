import apiService from './api';

class UploadService {
    // Upload a single document
    async uploadDocument(file, documentType, additionalData = {}) {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', documentType);

            // Add any additional data
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });

            // Use fetch directly for file uploads to avoid Content-Type issues
            const response = await fetch(`${apiService.baseURL}/upload/document`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiService.token}`,
                    // Don't set Content-Type, let browser set it with boundary
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Upload multiple documents
    async uploadMultipleDocuments(files, documentType, additionalData = {}) {
        try {
            const formData = new FormData();

            // Append all files
            files.forEach(file => {
                formData.append('documents', file);
            });

            formData.append('documentType', documentType);

            // Add any additional data
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });

            // Use fetch directly for file uploads to avoid Content-Type issues
            const response = await fetch(`${apiService.baseURL}/upload/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiService.token}`,
                    // Don't set Content-Type, let browser set it with boundary
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Delete uploaded document
    async deleteDocument(filename, documentType = 'general') {
        try {
            const response = await apiService.delete(`/upload/document/${filename}?documentType=${documentType}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get file URL
    getFileUrl(filename, documentType = 'general') {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        // For now, all files are stored in 'general' folder due to document type issue
        // TODO: Fix document type handling in backend
        return `${baseUrl}/uploads/documents/general/${filename}`;
    }

    // Validate file type
    validateFileType(file) {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        return allowedTypes.includes(file.type);
    }

    // Validate file size (10MB limit)
    validateFileSize(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export default new UploadService();
