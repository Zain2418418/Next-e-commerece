import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  
  // User Role 🛡️ (User ya Admin)
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },

  // OTP Fields 🔐
  otp: { type: String },
  otpExpires: { type: Date },

  // Reset Password Fields 🔑
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);