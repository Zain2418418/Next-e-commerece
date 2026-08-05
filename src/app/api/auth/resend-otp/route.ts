import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    let email = body.email;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    // Clean Email formatting
    email = decodeURIComponent(email).trim().toLowerCase();

    // Find User
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: 'Account is already verified. Please sign in.' }, { status: 400 });
    }

    // New 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = newOtp;
    user.otpExpires = otpExpires;
    await user.save();

    // Nodemailer Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your New OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Email Verification</h2>
          <p>Your new 6-digit verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 10px 20px; display: inline-block; letter-spacing: 4px;">${newOtp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'New OTP code sent successfully to your email!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('RESEND OTP ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error sending email.' }, { status: 500 });
  }
}