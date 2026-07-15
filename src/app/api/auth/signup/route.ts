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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${domain}/api/auth/verify?token=${verificationToken}`;

    // Nodemailer Transporter Setup using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'zainulabedeen2418@gmail.com', // Jis email se Brevo account banaya hai
        pass: process.env.BREVO_API_KEY, // Brevo API Key
      },
    });

    // SEND REAL EMAIL
    try {
      await transporter.sendMail({
        from: '"E-SHOP" <aapki_brevo_registered_email@gmail.com>', // Sender details
        to: email, // Naye registered user ki dynamic email address
        subject: 'Verify Your Email Address - E-SHOP',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #111; font-weight: 800;">Welcome to E-SHOP!</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for registering. Please verify your email address to activate your account.</p>
            <div style="margin: 32px 0;">
              <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully! Please check your email inbox for the verification link.' 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}