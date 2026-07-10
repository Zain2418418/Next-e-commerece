import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // URL se token nikalna
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token is missing' }, { status: 400 });
    }

    // Database mein token aur uski expiry check karna
    const user = await User.findOne({
      verificationToken: token,
      tokenExpiry: { $gt: new Date() }, // Token expire na hua ho
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token or token has expired.' },
        { status: 400 }
      );
    }

    // User ko verify mark karna aur tokens clear karna
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    // Verification ke baad temporary text response de rahe hain, baad mein frontend page par redirect karwa sakte hain
    return new Response('<h1>Account Verified Successfully! You can now log in.</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}