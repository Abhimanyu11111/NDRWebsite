import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Room from '../models/Room.js';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    console.log('📝 Fetching profile for user:', req.user.id);

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'company', 'role', 'created_at']
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ User found:', user.name);
    res.json({ success: true, user });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

// Get User Bookings - WITHOUT JOINS (SIMPLE)
export const getUserBookings = async (req, res) => {
  try {
    console.log('📝 Fetching bookings for user:', req.user.id);

    // ✅ Get bookings WITHOUT joins
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      raw: true  // Get plain objects
    });

    // ✅ Manually fetch room details for each booking
    const bookingsWithRooms = await Promise.all(
      bookings.map(async (booking) => {
        const room = await Room.findByPk(booking.room_id, {
          attributes: ['id', 'title', 'description'],
          raw: true
        });
        
        return {
          ...booking,
          Room: room || { title: 'Room Not Found' }
        };
      })
    );

    console.log(`✅ Found ${bookingsWithRooms.length} bookings`);
    res.json({ success: true, bookings: bookingsWithRooms });

  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};

// Get Payment History - WITHOUT JOINS (SIMPLE)
export const getPaymentHistory = async (req, res) => {
  try {
    console.log('📝 Fetching payments for user:', req.user.id);

    // ✅ Get payments WITHOUT joins
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      raw: true
    });

    // ✅ Manually fetch booking and room details
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const booking = await Booking.findOne({
          where: { booking_id: payment.booking_id },
          raw: true
        });

        let room = null;
        if (booking) {
          room = await Room.findByPk(booking.room_id, {
            attributes: ['title'],
            raw: true
          });
        }

        return {
          ...payment,
          Booking: booking ? {
            ...booking,
            Room: room || { title: 'N/A' }
          } : null
        };
      })
    );

    console.log(`✅ Found ${paymentsWithDetails.length} payments`);
    res.json({ success: true, payments: paymentsWithDetails });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment history', 
      error: error.message 
    });
  }
};