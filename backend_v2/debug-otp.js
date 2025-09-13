const mongoose = require('mongoose');
const User = require('./models/User');

async function debugOTP() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms2');
    console.log('Connected to MongoDB');
    
    // Check if there are any users with mobile numbers
    const users = await User.find({}, 'mobileNumber otpCode otpExpiresAt status onboardingStatus');
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`Mobile: ${user.mobileNumber}, OTP: ${user.otpCode}, Expires: ${user.otpExpiresAt}, Status: ${user.status}, Onboarding: ${user.onboardingStatus}`);
    });
    
    // Test mobile login for a specific number
    const testMobile = '9999999990';
    console.log(`\nTesting mobile login for: ${testMobile}`);
    
    const user = await User.findOne({ mobileNumber: testMobile });
    if (user) {
      console.log('User found:', {
        mobileNumber: user.mobileNumber,
        status: user.status,
        onboardingStatus: user.onboardingStatus,
        inviteExpiryTime: user.inviteExpiryTime,
        invitationToken: user.invitationToken
      });
      
      // Test OTP generation
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = Date.now() + 10 * 60 * 1000;
      
      console.log(`Generated OTP: ${otp}`);
      console.log(`OTP Expires At: ${new Date(otpExpiresAt)}`);
      
      user.otpCode = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
      
      console.log('OTP saved successfully!');
      
      // Verify it was saved
      const updatedUser = await User.findOne({ mobileNumber: testMobile });
      console.log('After save - OTP:', updatedUser.otpCode, 'Expires:', updatedUser.otpExpiresAt);
      
    } else {
      console.log('No user found with mobile number:', testMobile);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugOTP();
