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
      return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
    }

    // 1. Clean & Decode Email (%40 -> @)
    email = decodeURIComponent(email).trim().toLowerCase();

    // 2. Case-insensitive Database Search
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: 'Account is already verified. Please login.' }, { status: 400 });
    }

    // 3. Generate New OTP & Expiry
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // 4. Vercel-Optimized Transporter (Port 465 + SSL)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL Connection
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
      connectionTimeout: 10000,
    });

    // 5. Send Email
    await transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your New Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; rounded: 10px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Here is your new 6-digit OTP verification code:</p>
          <h1 style="background: #f4f4f4; padding: 12px 24px; display: inline-block; letter-spacing: 5px; color: #000;">${newOtp}</h1>
          <p style="color: #777;">This code is valid for 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'A new OTP has been sent to your email address.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('RESEND OTP ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send OTP email.' }, { status: 500 });
  }
}