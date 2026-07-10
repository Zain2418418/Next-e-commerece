import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    // 3. Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { message: 'Please verify your email before logging in.' },
        { status: 403 }
      );
    }

    // 4. Check if password is correct
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    // 5. Create JWT Token Payload
    const tokenData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // 6. Sign Token
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: '1d', // 1 day expiry
    });

    // 7. Create Response and Set HTTP-only Cookie for security
    const response = NextResponse.json(
      { message: 'Login successful!', success: true },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true, // Safe from XSS attacks (client-side JS can't touch it)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 1 day in seconds
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}