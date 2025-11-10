/**
 * Targets Routes
 * CRUD operations for target profiles
 */

const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { getDatabase } = require('../database/init');
const { generateThumbnail, deleteImageFiles } = require('../utils/thumbnail');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * GET /api/targets
 * Retrieve all targets with their images
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();

    // Fetch all targets
    const targets = db.prepare(`
      SELECT id, title, description, plan, created_at
      FROM targets
      ORDER BY created_at DESC
    `).all();

    // Fetch images for each target
    const targetsWithImages = targets.map(target => {
      const images = db.prepare(`
        SELECT id, filename, thumbnail_filename, original_name
        FROM media
        WHERE item_type = 'target' AND item_id = ?
        ORDER BY created_at ASC
      `).all(target.id);

      return {
        ...target,
        images: images.map(img => ({
          id: img.id,
          url: `/uploads/${img.filename}`,
          thumbnailUrl: `/uploads/${img.thumbnail_filename}`,
          original_name: img.original_name
        }))
      };
    });

    db.close();

    res.json({
      ok: true,
      data: targetsWithImages
    });
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch targets'
    });
  }
});

/**
 * POST /api/targets
 * Create new target with images
 */
router.post('/',
  authenticateToken,
  upload.array('images', 6),
  handleUploadError,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
    body('description').trim().notEmpty().isLength({ max: 5000 }).withMessage('Description is required (max 5000 chars)'),
    body('plan').optional().trim().isLength({ max: 5000 }).withMessage('Plan must be less than 5000 chars')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, plan = '' } = req.body;
    const files = req.files || [];

    try {
      const db = getDatabase();

      // Insert target
      const insertTarget = db.prepare(`
        INSERT INTO targets (title, description, plan)
        VALUES (?, ?, ?)
      `);
      const result = insertTarget.run(title, description, plan);
      const targetId = result.lastInsertRowid;

      // Process uploaded images
      const images = [];
      for (const file of files) {
        // Generate thumbnail
        const thumbnailPath = await generateThumbnail(file.path);
        const thumbnailFilename = path.basename(thumbnailPath);

        // Insert media record
        const insertMedia = db.prepare(`
          INSERT INTO media (item_type, item_id, filename, thumbnail_filename, original_name, mime_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const mediaResult = insertMedia.run(
          'target',
          targetId,
          file.filename,
          thumbnailFilename,
          file.originalname,
          file.mimetype
        );

        images.push({
          id: mediaResult.lastInsertRowid,
          url: `/uploads/${file.filename}`,
          thumbnailUrl: `/uploads/${thumbnailFilename}`,
          original_name: file.originalname
        });
      }

      // Fetch created target
      const newTarget = db.prepare(`
        SELECT id, title, description, plan, created_at
        FROM targets
        WHERE id = ?
      `).get(targetId);

      db.close();

      res.status(201).json({
        ok: true,
        data: {
          ...newTarget,
          images
        },
        message: 'Target created successfully'
      });
    } catch (error) {
      console.error('Error creating target:', error);
      res.status(500).json({
        ok: false,
        message: 'Failed to create target'
      });
    }
  }
);

/**
 * DELETE /api/targets/:id
 * Delete target and associated images
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.id);

  if (isNaN(targetId)) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid target ID'
    });
  }

  try {
    const db = getDatabase();

    // Fetch associated media
    const media = db.prepare(`
      SELECT filename, thumbnail_filename
      FROM media
      WHERE item_type = 'target' AND item_id = ?
    `).all(targetId);

    // Delete target
    const deleteTarget = db.prepare('DELETE FROM targets WHERE id = ?');
    const result = deleteTarget.run(targetId);

    if (result.changes === 0) {
      db.close();
      return res.status(404).json({
        ok: false,
        message: 'Target not found'
      });
    }

    // Delete media records
    db.prepare('DELETE FROM media WHERE item_type = ? AND item_id = ?').run('target', targetId);

    db.close();

    // Delete physical files
    for (const file of media) {
      await deleteImageFiles(file.filename, file.thumbnail_filename, UPLOAD_DIR);
    }

    res.json({
      ok: true,
      message: 'Target deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete target'
    });
  }
});

module.exports = router;
