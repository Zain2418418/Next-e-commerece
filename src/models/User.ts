import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpires: { type: Date },
}, { timestamps: true });

// 🔒 DATABASE MEIN SAVE HONE SE PEHLE PASSWORD HASH KARNA:
UserSchema.pre('save', async function (next) {
  // Agar password modify nahi hua toh next step par jayein
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);