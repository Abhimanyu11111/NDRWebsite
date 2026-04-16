import Room from '../models/Room.js';  // Room.js se import (not Slot.js)

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
    if (!title || !full_day_rate) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and full_day_rate are required' 
      });
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
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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

    // Ye function booking data ko check karega
    // Abhi basic structure diya hai, booking integration baad me karenge

    const availability = {
      room_id,
      month,
      year,
      available_dates: [], // Booking data se calculate hoga
      booked_dates: []     // Booking data se aayega
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