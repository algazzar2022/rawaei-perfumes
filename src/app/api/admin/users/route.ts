import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (currentUser && currentUser.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'غير مصرح للعملاء العاديين بالوصول' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المستخدمين' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (currentUser && currentUser.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'غير مصرح للعملاء العاديين بالوصول' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'يرجى إدخال الاسم والبريد وكلمة المرور' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json({ error: 'البريد الإلكتروني مسجل مسبقاً لمستخدم آخر' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: userRole,
        phone: phone ? phone.trim() : null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message || 'فشل إنشاء المستخدم الإداري' }, { status: 500 });
  }
}
