import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs'; // 👈 Bcrypt import karein

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    // 🔒 YAHAN PASSWORD MANUAL HASH KAREIN (100% Bug-Free)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔢 6-Digit Secure OTP Generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes validity

    // Naya user secure hashed password ke sath save karein
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // 👈 Hashed password save ho raha hai!
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
        from: `"E-SHOP" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Account - One-Time Password (OTP)',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
            <h2 style="color: #111; font-weight: 800; margin-bottom: 5px;">Verify Your Email</h2>
            <p style="color: #666; font-size: 14px;">Use the security code below to active your E-SHOP account. This code is valid for 10 minutes.</p>
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}