import { bucket } from "../config/firebase.js";

/**
 * Upload a file to Firebase Storage
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFileToFirebase = async (fileBuffer, fileName, mimeType) => {
  try {
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const file = bucket.file(`documents/${uniqueFileName}`);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    // Make file public
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/documents/${uniqueFileName}`;

    return publicUrl;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFileFromFirebase = async (fileUrl) => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const file = bucket.file(`documents/${fileName}`);
    await file.delete();
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Upload file from base64 string
 * @param {string} base64String - The base64 encoded file string
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadBase64FileToFirebase = async (
  base64String,
  fileName,
  mimeType,
) => {
  try {
    const buffer = Buffer.from(base64String, "base64");
    return await uploadFileToFirebase(buffer, fileName, mimeType);
  } catch (error) {
    throw new Error(`Failed to upload base64 file: ${error.message}`);
  }
};
