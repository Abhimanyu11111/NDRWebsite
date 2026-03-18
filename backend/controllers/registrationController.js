// controllers/registrationController.js
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';

export const registerUser = async (req, res) => {
  try {
    const {
      title, full_name, email, phone, job_title,
      org_type, org_name, street, country, state, city, comments
    } = req.body;

    // Validation
    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Save in database
    const registration = await Registration.create({
      title, full_name, email, phone, job_title,
      org_type, org_name, street, country, state, city, comments,
      status: 'PENDING'
    });

    // Create notification for admin
    await Notification.create({
      user_id: 1, // Admin user ID (change if needed)
      type: 'REGISTRATION',
      message: `New registration request: ${full_name} (${org_type || 'N/A'}) - ${email} | Phone: ${phone}`,
      is_read: false,
      is_active: true
    });

    console.log('✅ Registration saved:', registration.id);

    res.json({
      success: true,
      message: 'Registration submitted successfully!',
      registration_id: registration.id
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration',
      error: error.message
    });
  }
};