import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    // Verification Token generate karein
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Naya user create karein
    const newUser = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${domain}/api/auth/verify?token=${verificationToken}`;

    // 📧 INSTANT GMAIL SMTP VIA NODEMAILER
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,       // Aapki Gmail address
          pass: process.env.GMAIL_APP_PASS,   // Google App Password (16 chars)
        },
      });

      await transporter.sendMail({
        from: `"E-SHOP" <${process.env.GMAIL_USER}>`,
        to: email, // Dynamic User's Email
        subject: 'Verify Your Email Address - E-SHOP',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #111; font-weight: 800; letter-spacing: -0.5px;">Welcome to E-SHOP!</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for registering. Please verify your email address to active your account.</p>
            <div style="margin: 32px 0;">
              <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      console.log('Email sent successfully via Gmail SMTP!');
    } catch (emailError: any) {
      console.error('Nodemailer Gmail Error:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully! Please check your email inbox.' 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}