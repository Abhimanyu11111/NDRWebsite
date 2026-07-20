import express from 'express';
import sequelize from '../src/config/db.js';
import { isOptionalBoundedString, isInEnum, validationError } from '../utils/validators.js';

const router = express.Router();

const BLOCK_AREAS = ['ONLAND', 'OFFSHORE'];

// Search blocks with filters
router.get('/search', async (req, res) => {
  try {
    const { q, regime, basin, block_area } = req.query;

    if (!isOptionalBoundedString(q, 100)) {
      return res.status(400).json(validationError('q must be at most 100 characters'));
    }
    if (!isOptionalBoundedString(regime, 100)) {
      return res.status(400).json(validationError('regime must be at most 100 characters'));
    }
    if (!isOptionalBoundedString(basin, 100)) {
      return res.status(400).json(validationError('basin must be at most 100 characters'));
    }
    if (block_area && !isInEnum(block_area, BLOCK_AREAS)) {
      return res.status(400).json(validationError(`block_area must be one of: ${BLOCK_AREAS.join(', ')}`));
    }

    let query = `
      SELECT id, block_name, regime, basin_name, block_area, operator 
      FROM blocks 
      WHERE 1=1
    `;
    
    const replacements = {};
    
    // Search filter
    if (q && q.length >= 2) {
      query += ` AND (
        block_name LIKE :searchTerm OR 
        basin_name LIKE :searchTerm OR 
        operator LIKE :searchTerm
      )`;
      replacements.searchTerm = `%${q}%`;
    }
    
    // Regime filter
    if (regime) {
      query += ` AND regime = :regime`;
      replacements.regime = regime;
    }
    
    // Basin filter
    if (basin) {
      query += ` AND basin_name = :basin`;
      replacements.basin = basin;
    }
    
    // Block area filter (ONLAND/OFFSHORE)
    if (block_area) {
      query += ` AND block_area = :block_area`;
      replacements.block_area = block_area;
    }
    
    // Higher limit when browsing by regime only (no text search)
    const limit = (regime && !q) ? 500 : 50;
    query += ` ORDER BY block_name ASC LIMIT ${limit}`;
    
    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({ success: true, blocks: results });
  } catch (error) {
    console.error('Block search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get unique regimes for dropdown
router.get('/regimes', async (req, res) => {
  try {
    const results = await sequelize.query(
      `SELECT DISTINCT regime FROM blocks ORDER BY regime`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    res.json({ 
      success: true, 
      regimes: results.map(r => r.regime) 
    });
  } catch (error) {
    console.error('Regimes fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;