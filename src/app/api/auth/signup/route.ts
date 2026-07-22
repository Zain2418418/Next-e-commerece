import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    // 1. Detailed Validation Checks
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 2. Existing User Check
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // 🔒 Manual Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔢 6-Digit Secure OTP Generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes validity

    // Save user with hashed password
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpires,
    });

    // 📧 Send OTP via Gmail SMTP
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"E-STORE" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Account - One-Time Password (OTP)',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
            <h2 style="color: #111; font-weight: 800; margin-bottom: 5px;">Verify Your Email</h2>
            <p style="color: #666; font-size: 14px;">Use the security code below to activate your E-STORE account. This code is valid for 10 minutes.</p>
            <div style="margin: 24px 0; background-color: #f4f4f5; padding: 16px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #000;">${otp}</span>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Nodemailer OTP Error:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email. Please verify your account.' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account. Please try again.' }, 
      { status: 500 }
    );
  }
}