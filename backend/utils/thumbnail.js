/**
 * Thumbnail Generation Utility
 * Uses Sharp to create optimized thumbnails from uploaded images
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const THUMBNAIL_WIDTH = 300; // 300px width for thumbnails
const THUMBNAIL_QUALITY = 80; // JPEG quality for thumbnails

/**
 * Generate thumbnail for an image file
 * @param {string} originalPath - Path to original image
 * @returns {Promise<string>} - Path to generated thumbnail
 */
async function generateThumbnail(originalPath) {
  const ext = path.extname(originalPath);
  const dirname = path.dirname(originalPath);
  const basename = path.basename(originalPath, ext);
  const thumbnailPath = path.join(dirname, `${basename}_thumb${ext}`);

  try {
    await sharp(originalPath)
      .resize(THUMBNAIL_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toFile(thumbnailPath);

    console.log(`✓ Generated thumbnail: ${path.basename(thumbnailPath)}`);
    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

/**
 * Delete image and its thumbnail
 * @param {string} filename - Original filename
 * @param {string} thumbnailFilename - Thumbnail filename
 * @param {string} uploadDir - Upload directory path
 */
async function deleteImageFiles(filename, thumbnailFilename, uploadDir) {
  try {
    const originalPath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(uploadDir, thumbnailFilename);

    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
      console.log(`✓ Deleted image: ${filename}`);
    }

    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log(`✓ Deleted thumbnail: ${thumbnailFilename}`);
    }
  } catch (error) {
    console.error('Error deleting image files:', error);
  }
}

module.exports = { generateThumbnail, deleteImageFiles };
