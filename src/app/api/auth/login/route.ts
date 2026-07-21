import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // 1. Inputs validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' }, 
        { status: 400 }
      );
    }

    // 2. Find User in DB
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' }, 
        { status: 401 }
      );
    }

    // 3. Check if user has verified their email
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your email is not verified yet. Please check your inbox for OTP.',
          notVerified: true
        }, 
        { status: 403 }
      );
    }

    // 4. Match password with Hashed password in DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' }, 
        { status: 401 }
      );
    }

    // 🔑 5. Create JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        name: user.name 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 🚀 6. Create Response with Auth Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }, { status: 200 });

    // Set Token Cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Entire site access
      maxAge: 60 * 60 * 24 * 7, // 7 days expiration
    });

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error. Please try again later.' }, 
      { status: 500 }
    );
  }
}