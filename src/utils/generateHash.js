import crypto from 'crypto';
import fs from 'fs';

export const calculateFileHash = async (filePath) => {
    return new Promise((resolve, reject) => {
        try {
            if (!filePath) {
                reject(new Error('File path is required'));
                return;
            }

            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);

            // Handle stream events
            stream.on('data', (chunk) => {
                hash.update(chunk);
            });

            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });

            stream.on('error', (error) => {
                reject(new Error(`Error reading file: ${error.message}`));
            });
        } catch (error) {
            reject(new Error(`Error calculating file hash: ${error.message}`));
        }
    });
};
