import Room from '../models/Room.js';
import {
  isPositiveInt,
  isInEnum,
  isOptionalBoundedString,
  validationError,
} from '../utils/validators.js';

const ROOM_TYPES = ['OALP', 'DSF', 'CBM', 'GENERAL'];

/** Non-negative number check for money/capacity fields (accepts numeric strings). */
const isNonNegativeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
};

/**
 * Get all active rooms
 */
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { is_active: true },
      order: [['title', 'ASC']]
    });
    
    res.status(200).json({ 
      success: true,
      rooms 
    });
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message 
    });
  }
};

/**
 * Get room by ID
 */
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isPositiveInt(id)) {
      return res.status(400).json(validationError('id must be a positive integer'));
    }

    const room = await Room.findOne({
      where: { 
        id,
        is_active: true 
      }
    });

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      room 
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch room',
      error: error.message 
    });
  }
};

/**
 * Get rooms by type (OALP/DSF/CBM/GENERAL)
 */
export const getRoomsByType = async (req, res) => {
  try {
    const { room_type } = req.query;

    if (room_type && !isInEnum(room_type, ROOM_TYPES)) {
      return res.status(400).json(validationError(`room_type must be one of: ${ROOM_TYPES.join(', ')}`));
    }

    const whereClause = { is_active: true };
    if (room_type) {
      whereClause.room_type = room_type;
    }

    const rooms = await Room.findAll({
      where: whereClause,
      order: [['title', 'ASC']]
    });

    res.status(200).json({ 
      success: true,
      rooms,
      count: rooms.length 
    });
  } catch (error) {
    console.error('Get rooms by type error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message 
    });
  }
};

/**
 * Create new room (Admin only)
 */
export const createRoom = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      capacity, 
      hourly_rate, 
      half_day_rate, 
      full_day_rate,
      license_type,
      room_type 
    } = req.body;

    // Validation
    if (!isNonEmptyString(title, 255)) {
      return res.status(400).json(validationError('title is required and must be at most 255 characters'));
    }
    if (!isOptionalBoundedString(description, 5000)) {
      return res.status(400).json(validationError('description must be at most 5000 characters'));
    }
    if (capacity !== undefined && capacity !== null && capacity !== '' && !isPositiveInt(capacity)) {
      return res.status(400).json(validationError('capacity must be a positive integer'));
    }
    if (!isNonNegativeNumber(full_day_rate)) {
      return res.status(400).json(validationError('full_day_rate is required and must be a non-negative number'));
    }
    if (hourly_rate !== undefined && hourly_rate !== null && hourly_rate !== '' && !isNonNegativeNumber(hourly_rate)) {
      return res.status(400).json(validationError('hourly_rate must be a non-negative number'));
    }
    if (half_day_rate !== undefined && half_day_rate !== null && half_day_rate !== '' && !isNonNegativeNumber(half_day_rate)) {
      return res.status(400).json(validationError('half_day_rate must be a non-negative number'));
    }
    if (!isOptionalBoundedString(license_type, 100)) {
      return res.status(400).json(validationError('license_type must be at most 100 characters'));
    }
    if (room_type && !isInEnum(room_type, ROOM_TYPES)) {
      return res.status(400).json(validationError(`room_type must be one of: ${ROOM_TYPES.join(', ')}`));
    }

    const room = await Room.create({
      title,
      description,
      capacity,
      hourly_rate: hourly_rate || 0,
      half_day_rate: half_day_rate || 0,
      full_day_rate,
      license_type,
      room_type: room_type || 'GENERAL',
      is_active: true
    });

    res.status(201).json({ 
      success: true,
      message: 'Room created successfully',
      room 
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create room',
      error: error.message 
    });
  }
};

/**
 * Update room (Admin only)
 */
// Only these columns may ever be changed via this endpoint — anything else
// in the request body (id, is_active, timestamps, ...) is silently ignored
// rather than blindly written to the row.
const UPDATABLE_ROOM_FIELDS = [
  'title', 'description', 'capacity',
  'hourly_rate', 'half_day_rate', 'full_day_rate',
  'license_type', 'room_type',
];

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isPositiveInt(id)) {
      return res.status(400).json(validationError('id must be a positive integer'));
    }

    const body = req.body || {};
    const updates = {};
    for (const field of UPDATABLE_ROOM_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) updates[field] = body[field];
    }

    if ('title' in updates && !isNonEmptyString(updates.title, 255)) {
      return res.status(400).json(validationError('title must be a non-empty string of at most 255 characters'));
    }
    if ('description' in updates && !isOptionalBoundedString(updates.description, 5000)) {
      return res.status(400).json(validationError('description must be at most 5000 characters'));
    }
    if ('capacity' in updates && updates.capacity !== null && !isPositiveInt(updates.capacity)) {
      return res.status(400).json(validationError('capacity must be a positive integer'));
    }
    for (const rateField of ['hourly_rate', 'half_day_rate', 'full_day_rate']) {
      if (rateField in updates && !isNonNegativeNumber(updates[rateField])) {
        return res.status(400).json(validationError(`${rateField} must be a non-negative number`));
      }
    }
    if ('license_type' in updates && !isOptionalBoundedString(updates.license_type, 100)) {
      return res.status(400).json(validationError('license_type must be at most 100 characters'));
    }
    if ('room_type' in updates && !isInEnum(updates.room_type, ROOM_TYPES)) {
      return res.status(400).json(validationError(`room_type must be one of: ${ROOM_TYPES.join(', ')}`));
    }

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.update(updates);

    res.status(200).json({ 
      success: true,
      message: 'Room updated successfully',
      room 
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update room',
      error: error.message 
    });
  }
};

/**
 * Delete/Deactivate room (Admin only)
 */
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isPositiveInt(id)) {
      return res.status(400).json(validationError('id must be a positive integer'));
    }

    const room = await Room.findByPk(id);
    
    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    // Soft delete - just deactivate
    await room.update({ is_active: false });

    res.status(200).json({ 
      success: true,
      message: 'Room deactivated successfully' 
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete room',
      error: error.message 
    });
  }
};

/**
 * Get room availability for calendar
 */
export const getRoomAvailability = async (req, res) => {
  try {
    const { room_id, month, year } = req.query;

    if (room_id !== undefined && !isPositiveInt(room_id)) {
      return res.status(400).json(validationError('room_id must be a positive integer'));
    }
    if (month !== undefined && !(Number(month) >= 1 && Number(month) <= 12)) {
      return res.status(400).json(validationError('month must be between 1 and 12'));
    }
    if (year !== undefined && !(Number(year) >= 2000 && Number(year) <= 2100)) {
      return res.status(400).json(validationError('year must be a valid year'));
    }

    // Ye function booking data ko check karega
    // Abhi basic structure diya hai, booking integration baad me karenge

    const availability = {
      room_id,
      month,
      year,
      available_dates: [],
      booked_dates: []     
    };

    res.status(200).json({ 
      success: true,
      availability 
    });
  } catch (error) {
    console.error('Get room availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch availability',
      error: error.message 
    });
  }
};