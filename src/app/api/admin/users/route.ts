import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// GET: Fetch All Users for Admin Panel
export async function GET() {
  try {
    await dbConnect();

    // Passwords ko query result se exclude kar rahe hain (-password)
    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}