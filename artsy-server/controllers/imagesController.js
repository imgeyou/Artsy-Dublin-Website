const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ALLOWED_MIME_TYPES =  ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5*1024*1024; 
const MAX_IMAGES = 5;
const TEMP_DIR = path.join(__dirname, '..', 'public', 'uploads', 'temp');
 const RESIZED_DIR = path.join(__dirname, '..', 'public', 'uploads', 'resized');

// create directories 
if  (!fs.existsSync(TEMP_DIR))  fs.mkdirSync(TEMP_DIR, { recursive: true });

if (!fs.existsSync(RESIZED_DIR)) fs.mkdirSync(RESIZED_DIR, { recursive: true });

/**Processes images uploaded via express-fileupload- type, size, resize,etc
  @param {object} files 
  @returns {Promise<string[]>} 
 */
async function processUploadedImages(files) {
   if (!files || !files.images) return []; 

 //normalising
 const imageFiles= Array.isArray (files.images) ? files.images : [files.images];

//validate img count
  if (imageFiles.length > MAX_IMAGES) {
     throw new Error (`Maximum amount of images allowed is ${MAX_IMAGES}`);
    }
    const savedUrls = [];

 for (const image of imageFiles) {
 //validation type and size
     if (ALLOWED_MIME_TYPES.indexOf(image.mimetype) < 0) {
         throw new Error (`"${image.name}" is invalid image format. Please, make sure you image is .jpg, .jpeg, .png or .webp`);
        }
     if (image.size > MAX_FILE_SIZE) {
         throw new Error (`"${image.name}" exceeds the allowed 5MB size limit`);
        }

    //build file paths
     const uniqueName = Date.now() + '_' + image.name;
     const tempPath = path.join(TEMP_DIR, uniqueName);
     const resizedName = 'resized_' + uniqueName;
     const resizedPath = path.join(RESIZED_DIR, resizedName);
     await image.mv(tempPath); //move uploaded file to temp location
     await sharp(tempPath) //resize to 750px
         .resize(750)
         .toFile(resizedPath);
     // delete the temp file after img is resized
     fs.unlink(tempPath, (err) => {
         if (err) console.error('Failed to delete temp file:', err.message);
         else console.log(tempPath + ' deleted');
        });
        // store relative URL for the database
     savedUrls.push('uploads/resized/' + resizedName);
    }
 return savedUrls;

}




module.exports= { processUploadedImages };
