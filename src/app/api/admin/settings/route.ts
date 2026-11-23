import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');

    const where: any = {};
    if (group) where.group = group;

    const settings = await prisma.siteSetting.findMany({ where });
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return NextResponse.json({ settings: settingsMap, raw: settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإعدادات' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل الإعدادات' }, { status: 401 });
    }

    const body = await request.json(); // key-value pairs or array of { key, value, group }

    if (Array.isArray(body)) {
      for (const item of body) {
        await prisma.siteSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value), group: item.group || 'general' },
          create: { key: item.key, value: String(item.value), group: item.group || 'general' },
        });
      }
    } else {
      for (const [key, value] of Object.entries(body)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), group: 'general' },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: error.message || 'فشل حفظ الإعدادات' }, { status: 500 });
  }
}
