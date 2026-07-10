import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields (name, email, password) are required.' },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered.' },
        { status: 400 }
      );
    }

    // 3. Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // 4. Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    // 5. Create User in Database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      tokenExpiry,
    });

    await newUser.save();

    // 6. Mock Email Verification Link (For testing in console)
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${verificationToken}`;
    console.log('=== MOCK EMAIL VERIFICATION LINK ===');
    console.log(verificationUrl);
    console.log('====================================');

    return NextResponse.json(
      { 
        message: 'User registered successfully! Please check the terminal console for the verification link.',
        userId: newUser._id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}