import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security warning: screen par direct error nahi dete, but yahan dynamic error handling hai
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    // Generate Code
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Min valid

    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpires = resetOtpExpires;
    await user.save();

    // Send Mail
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
        subject: 'Reset Password Code - E-SHOP',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
            <h2 style="color: #111; font-weight: 800; margin-bottom: 5px;">Reset Password</h2>
            <p style="color: #666; font-size: 14px;">Use the code below to reset your E-SHOP password. This code expires in 10 minutes.</p>
            <div style="margin: 24px 0; background-color: #f4f4f5; padding: 16px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #000;">${resetOtp}</span>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('Reset OTP Mail Failed:', err);
    }

    return NextResponse.json({ success: true, message: 'Password reset code sent to your email.' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}