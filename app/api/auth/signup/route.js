import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '../../../../lib/db.js';
import { hashPassword, signToken, COOKIE_NAME } from '../../../../lib/auth.js';
import { sendWelcomeEmail } from '../../../../lib/email.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'applicant', companyName = '' } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      name,
      role: role === 'hirer' ? 'hirer' : 'applicant',
      companyName: role === 'hirer' ? companyName : ''
    });

    // Send welcome email in background
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role
    }).catch(err => console.error('Welcome email error:', err));

    const token = signToken(user);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_name: user.company_name
      }
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
}
