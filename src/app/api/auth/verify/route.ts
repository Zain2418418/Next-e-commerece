import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and OTP are required.' }, { status: 400 });
    }

    // Database mein user ko dhoondein
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // 🚨 Checks: Invalid ya Expired OTP
    if (user.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid verification code.' }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ success: false, error: 'OTP has expired. Please signup again.' }, { status: 400 });
    }

    // Active & Verify User
    user.isVerified = true;
    user.otp = undefined; // OTP remove kar dein verification ke baad
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Account verified successfully! You can now login.' 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}