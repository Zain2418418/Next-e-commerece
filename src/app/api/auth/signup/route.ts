import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import { Resend } from 'resend';

// ❌ YAHAN SE RESEND INITALIZATION KO REMOVE KAR DEIN (DO NOT INITIALIZE HERE)

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
    
    // Naya user create karein (isVerified defaults to false)
    const newUser = await User.create({
      name,
      email,
      password, // Password hashing model ke pre-save hook mein handle ho rahi hogi
      isVerified: false,
      verificationToken,
    });

    // Dynamic Verification Link (Detect if local or production)
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${domain}/api/auth/verify?token=${verificationToken}`;

    // ✅ RESEND KO FUNCTION KE ANDAR INITIALIZE KAREIN (TAAKE BUILD CRASH NA HO)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Resend API Key is missing in environment variables.");
    }
    const resend = new Resend(apiKey || 'temp_key_for_build');

    // SEND REAL EMAIL USING RESEND
    try {
      if (apiKey) {
        await resend.emails.send({
          from: 'onboarding@resend.dev', // Resend ka default free domain
          to: email, // Jis email se user ne signup kiya hai
          subject: 'Verify Your Email Address - E-SHOP',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #111; font-weight: 800; letter-spacing: -0.5px;">Welcome to E-SHOP!</h2>
              <p style="color: #666; line-height: 1.6;">Thank you for registering. Please verify your email address to activate your account and explore premium shopping.</p>
              <div style="margin: 32px 0;">
                <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      }
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