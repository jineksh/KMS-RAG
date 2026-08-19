import { prisma } from '../config/db.js';
import { calculateFileHash } from '../utils/generateHash.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { indexingPhase } from "../rag/ingition.js";
import indexingQueue from '../queue/indexing.js';

export const handleUpload = async (file, user) => {
    try {
        if (!file) {
            throw new Error('File is required');
        }

        if (!user || !user.id) {
            throw new Error('User ID is required');
        }

        const fileName = file.originalname;
        const filePath = file.path;

        console.log(filePath);

        if (!filePath) {
            throw new Error('File path is missing');
        }

        const fileExists = fs.existsSync(filePath);
        if (!fileExists) {
            throw new Error('File not found at specified path');
        }

        const fileHash = await calculateFileHash(filePath);



        const existingDocument = await prisma.document.findFirst({
            where: { hash_code: fileHash },
        });

        if (existingDocument) {
            return {
                name: existingDocument.doc_name,
                hash_code: existingDocument.hash_code,
                id: existingDocument.id,
            };
        }

        const newDocument = await prisma.document.create({
            data: {
                userId: user.id,
                doc_name: fileName,
                hash_code: fileHash,
                status: 'PENDING',
            },
        });

        await indexingQueue.add('indexing-job', {
            filePath: filePath,
            documentId: newDocument.id,
        });

        return newDocument;
    } catch (error) {
        if (file && file.path) {
            try {
                await fsPromises.unlink(file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError.message);
            }
        }

        throw new Error(`Upload failed: ${error.message}`);
    }
};

export const getUserDocuments = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const documents = await prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return documents;
    } catch (error) {
        throw new Error(`Failed to get documents: ${error.message}`);
    }
};

export const getDocumentById = async (docId, userId) => {
    try {
        if (!docId || !userId) {
            throw new Error('Document ID and User ID are required');
        }

        const document = await prisma.document.findUnique({
            where: { id: docId },
            include: { user: true },
        });

        if (!document) {
            throw new Error('Document not found');
        }

        if (document.userId !== userId) {
            throw new Error('Unauthorized access to this document');
        }

        return document;
    } catch (error) {
        throw new Error(`Failed to get document: ${error.message}`);
    }
};

export const updateDocumentStatus = async (docId, status, userId) => {
    try {
        if (!docId || !status || !userId) {
            throw new Error('Document ID, status, and User ID are required');
        }

        const validStatuses = ['PENDING', 'PROCESSED', 'ERROR'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const document = await prisma.document.findUnique({
            where: { id: docId },
        });

        if (!document) {
            throw new Error('Document not found');
        }

        if (document.userId !== userId) {
            throw new Error('Unauthorized access to this document');
        }

        const updatedDocument = await prisma.document.update({
            where: { id: docId },
            data: { status },
        });

        return updatedDocument;
    } catch (error) {
        throw new Error(`Failed to update document status: ${error.message}`);
    }
};


