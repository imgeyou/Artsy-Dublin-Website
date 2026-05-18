const cloudinary = require('cloudinary').v2;

// CLOUDINARY_URL env var is picked up automatically by the SDK

const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const POST_MAX_SIZE   = 5 * 1024 * 1024; // 5MB
const POST_MAX_COUNT  = 5;
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp'];

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

async function uploadAvatar(files) {
  if (!files || !files.images) return null;

  const file = Array.isArray(files.images) ? files.images[0] : files.images;

  if (!ALLOWED_TYPES.includes(file.mimetype))
    throw new Error(`"${file.name}" must be .jpg, .jpeg, .png or .webp`);
  if (file.size > AVATAR_MAX_SIZE)
    throw new Error(`Avatar must be under 2MB`);

  const result = await uploadToCloudinary(file.data, {
    folder: 'artsy-dublin/avatars',
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  });

  return result.secure_url;
}

async function uploadPostImages(files) {
  if (!files || !files.images) return [];

  const imageFiles = Array.isArray(files.images) ? files.images : [files.images];

  if (imageFiles.length > POST_MAX_COUNT)
    throw new Error(`Maximum ${POST_MAX_COUNT} images per post`);

  const urls = [];
  for (const image of imageFiles) {
    if (!ALLOWED_TYPES.includes(image.mimetype))
      throw new Error(`"${image.name}" must be .jpg, .jpeg, .png or .webp`);
    if (image.size > POST_MAX_SIZE)
      throw new Error(`"${image.name}" exceeds the 5MB limit`);

    const result = await uploadToCloudinary(image.data, {
      folder: 'artsy-dublin/posts',
      transformation: [{ width: 750, crop: 'limit' }],
    });
    urls.push(result.secure_url);
  }

  return urls;
}

module.exports = { uploadAvatar, uploadPostImages };
