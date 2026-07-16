import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

    // 3. Check if user has verified their email (🚨 MOST IMPORTANT)
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your email is not verified yet. Please check your inbox for OTP.',
          notVerified: true // Frontend check ke liye taake chahein toh seedha OTP page par redirect kar skein
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

    // 5. Success Login Response (Yahan aap JWT token ya session cookies set kar sakte hain)
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error. Please try again later.' }, 
      { status: 500 }
    );
  }
}