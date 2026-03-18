// this is the controller for image related stuff

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_POST = 5;

const TEMP_DIR = path.join(__dirname, '..', 'public', 'uploads', 'temp');
const RESIZED_DIR = path.join(__dirname, '..', 'public', 'uploads', 'resized');

// create directories if they don't exist yet
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR,    { recursive: true });
if (!fs.existsSync(RESIZED_DIR)) fs.mkdirSync(RESIZED_DIR, { recursive: true });

/**Processes images uploaded via express-fileupload.
 Validates type and size, resizes to 750px width using sharp,
 deletes the temp original, and returns relative URLs for database storage.
 * @param {object} files - req.files from express-fileupload middleware
 * @returns {Promise<string[]>} array of relative image URLs
 */
async function processUploadedImages(files) {
    // no files uploaded, return empty array (images are optional)
    if (!files || !files.images) return [];

    // normalise: single file comes as object, multiple come as array
    const imageFiles = Array.isArray(files.images) ? files.images : [files.images];

    // validate image count
    if (imageFiles.length > MAX_IMAGES_PER_POST) {
        throw new Error(`Too many images. Maximum allowed is ${MAX_IMAGES_PER_POST}.`);
    }

    const savedUrls = [];

    for (const image of imageFiles) {

        // validate file type
        if (ACCEPTED_MIME_TYPES.indexOf(image.mimetype) < 0) {
            throw new Error(`"${image.name}" is not a valid image. Only JPG, PNG and WebP are allowed.`);
        }

        // validate file size
        if (image.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`"${image.name}" exceeds the 5MB size limit.`);
        }

        // build file paths
        const uniqueName = Date.now() + '_' + image.name;
        const tempPath = path.join(TEMP_DIR,    uniqueName);
        const resizedName = 'resized_' + uniqueName;
        const resizedPath = path.join(RESIZED_DIR, resizedName);

        // move uploaded file to temp location
        await image.mv(tempPath);

        // resize to 750px width, preserving aspect ratio
        await sharp(tempPath)
            .resize(750)
            .toFile(resizedPath);

        // delete the original temp file after resizing
        fs.unlink(tempPath, (err) => {
            if (err) console.error('Failed to delete temp file:', err.message);
            else console.log(tempPath + ' deleted');
        });

        // store relative URL for the database
        savedUrls.push('uploads/resized/' + resizedName);
    }

    return savedUrls;
}

module.exports = { processUploadedImages };