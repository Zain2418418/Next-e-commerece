import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs'; // Password hashing ke liye

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Check code validity
    if (user.resetPasswordOtp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid reset code.' }, { status: 400 });
    }

    if (new Date() > new Date(user.resetPasswordOtpExpires)) {
      return NextResponse.json({ success: false, error: 'Reset code expired.' }, { status: 400 });
    }

    // Hash New Password (Agar dynamic model hooks pehle se hash nahi kar rahe)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully! You can now login.' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}