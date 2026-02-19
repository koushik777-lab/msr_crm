const multer = require("multer");
const storage = multer.memoryStorage();

const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5 MB limit
  },
});

// Create middleware functions for different upload scenarios
const uploadSingle = (fieldName) => multerUpload.single(fieldName);
const uploadMultiple = (fieldName, maxCount) =>
  multerUpload.array(fieldName, maxCount);
const uploadFields = (fields) => multerUpload.fields(fields);

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
};
