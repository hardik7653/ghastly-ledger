/**
 * Cases Routes
 * CRUD operations for investigation cases
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
 * GET /api/cases
 * Retrieve all cases with their images
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();

    // Fetch all cases
    const cases = db.prepare(`
      SELECT id, title, description, mistakes, created_at
      FROM cases
      ORDER BY created_at DESC
    `).all();

    // Fetch images for each case
    const casesWithImages = cases.map(caseItem => {
      const images = db.prepare(`
        SELECT id, filename, thumbnail_filename, original_name
        FROM media
        WHERE item_type = 'case' AND item_id = ?
        ORDER BY created_at ASC
      `).all(caseItem.id);

      return {
        ...caseItem,
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
      data: casesWithImages
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch cases'
    });
  }
});

/**
 * POST /api/cases
 * Create new case with images
 */
router.post('/',
  authenticateToken,
  upload.array('images', 6),
  handleUploadError,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
    body('description').trim().notEmpty().isLength({ max: 5000 }).withMessage('Description is required (max 5000 chars)'),
    body('mistakes').optional().trim().isLength({ max: 5000 }).withMessage('Mistakes must be less than 5000 chars')
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

    const { title, description, mistakes = '' } = req.body;
    const files = req.files || [];

    try {
      const db = getDatabase();

      // Insert case
      const insertCase = db.prepare(`
        INSERT INTO cases (title, description, mistakes)
        VALUES (?, ?, ?)
      `);
      const result = insertCase.run(title, description, mistakes);
      const caseId = result.lastInsertRowid;

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
          'case',
          caseId,
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

      // Fetch created case
      const newCase = db.prepare(`
        SELECT id, title, description, mistakes, created_at
        FROM cases
        WHERE id = ?
      `).get(caseId);

      db.close();

      res.status(201).json({
        ok: true,
        data: {
          ...newCase,
          images
        },
        message: 'Case created successfully'
      });
    } catch (error) {
      console.error('Error creating case:', error);
      res.status(500).json({
        ok: false,
        message: 'Failed to create case'
      });
    }
  }
);

/**
 * DELETE /api/cases/:id
 * Delete case and associated images
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const caseId = parseInt(req.params.id);

  if (isNaN(caseId)) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid case ID'
    });
  }

  try {
    const db = getDatabase();

    // Fetch associated media
    const media = db.prepare(`
      SELECT filename, thumbnail_filename
      FROM media
      WHERE item_type = 'case' AND item_id = ?
    `).all(caseId);

    // Delete case (cascade will handle media table)
    const deleteCase = db.prepare('DELETE FROM cases WHERE id = ?');
    const result = deleteCase.run(caseId);

    if (result.changes === 0) {
      db.close();
      return res.status(404).json({
        ok: false,
        message: 'Case not found'
      });
    }

    // Delete media records
    db.prepare('DELETE FROM media WHERE item_type = ? AND item_id = ?').run('case', caseId);

    db.close();

    // Delete physical files
    for (const file of media) {
      await deleteImageFiles(file.filename, file.thumbnail_filename, UPLOAD_DIR);
    }

    res.json({
      ok: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete case'
    });
  }
});

module.exports = router;
