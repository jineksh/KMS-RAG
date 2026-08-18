import {
    handleUpload,
    getUserDocuments,
    getDocumentById,
    updateDocumentStatus,
    deleteDocument,
} from '../services/document.js';

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided',
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required',
            });
        }

        const document = await handleUpload(req.file, req.user);

        return res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document,
        });
    } catch (error) {
        if (error.message.includes('File') || error.message.includes('path')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('User ID')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

export const getUserDocs = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required',
            });
        }

        const documents = await getUserDocuments(req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Documents retrieved successfully',
            data: documents,
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

export const getDoc = async (req, res) => {
    try {
        const { docId } = req.params;

        if (!docId || isNaN(docId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid document ID is required',
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required',
            });
        }

        const document = await getDocumentById(parseInt(docId), req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Document retrieved successfully',
            data: document,
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

export const updateDocStatus = async (req, res) => {
    try {
        const { docId } = req.params;
        const { status } = req.body;

        if (!docId || isNaN(docId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid document ID is required',
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required',
            });
        }

        const updatedDocument = await updateDocumentStatus(
            parseInt(docId),
            status,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: 'Document status updated successfully',
            data: updatedDocument,
        });
    } catch (error) {
        if (error.message.includes('Invalid status')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

export const deleteDoc = async (req, res) => {
    try {
        const { docId } = req.params;

        if (!docId || isNaN(docId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid document ID is required',
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required',
            });
        }

        const deletedDocument = await deleteDocument(parseInt(docId), req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            data: deletedDocument,
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};