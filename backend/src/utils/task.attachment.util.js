import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import logger from './logger.util.js';

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'tasks');

const MIME_TYPE_EXTENSIONS = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

export const createUploadError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  error.publicMessage = message;
  return error;
};

const getSafeFilePath = (fileUrl) => {
  const sanitizedUrl = String(fileUrl || '').replace(/^\/+/, '');
  return sanitizedUrl ? path.join(process.cwd(), sanitizedUrl) : null;
};

export const getAttachmentExtension = (file) => {
  if (MIME_TYPE_EXTENSIONS[file.mimetype]) {
    return MIME_TYPE_EXTENSIONS[file.mimetype];
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  return extension || '.bin';
};

export const prepareTaskAttachment = async (file) => {
  if (!file) {
    return null;
  }

  await fs.mkdir(UPLOAD_ROOT, { recursive: true });

  const attachmentId = randomUUID();
  const extension = getAttachmentExtension(file);
  const fileName = `${attachmentId}${extension}`;
  const filePath = path.join(UPLOAD_ROOT, fileName);

  await fs.writeFile(filePath, file.buffer);

  return {
    id: attachmentId,
    fileName: path.basename(file.originalname || fileName),
    fileUrl: `/uploads/tasks/${fileName}`,
    fileType: file.mimetype,
    fileSize: file.size,
    filePath,
  };
};

export const deleteTaskAttachmentFile = async (fileUrl) => {
  const filePath = getSafeFilePath(fileUrl);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn('Failed to delete task attachment file.', {
        filePath,
        error: error.message,
      });
    }
  }
};

export const deleteTaskAttachmentFiles = async (attachments = []) => {
  for (const attachment of attachments) {
    if (!attachment?.fileUrl) {
      continue;
    }

    await deleteTaskAttachmentFile(attachment.fileUrl);
  }
};
