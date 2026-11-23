import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، الجوال، وكلمة المرور)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create User with role CUSTOMER
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: 'CUSTOMER',
        isActive: true,
      },
    });

    // Create or link Customer model
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: cleanPhone }],
      },
    });

    if (existingCustomer) {
      await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          userId: newUser.id,
          name: name.trim(),
        },
      });
    } else {
      await prisma.customer.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          totalOrders: 0,
          totalSpent: 0,
        },
      });
    }

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });

    response.cookies.set({
      name: 'rawaei_auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
