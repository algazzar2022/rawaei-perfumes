import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'لا يمكن حذف المسؤول الوحيد المتبقي في النظام' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل حذف المستخدم' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { role, isActive, phone } = body;

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (phone !== undefined) updateData.phone = phone;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل تعديل المستخدم' },
      { status: 500 }
    );
  }
}
