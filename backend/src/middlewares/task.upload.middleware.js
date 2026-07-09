import multer from 'multer';

import {
  createUploadError,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '../utils/task.attachment.util.js';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(createUploadError('Only PDF, JPG, and PNG files are allowed.'));
  },
});

const taskAttachmentUpload = (req, res, next) => {
  upload.single('attachment')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(createUploadError('Attachment must be 5 MB or smaller.'));
        return;
      }

      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        next(createUploadError('Only one attachment is allowed per task.'));
        return;
      }

      next(createUploadError(error.message));
      return;
    }

    next(error);
  });
};

export default taskAttachmentUpload;
