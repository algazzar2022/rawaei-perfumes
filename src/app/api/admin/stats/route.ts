import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // 1. Total revenue & orders count
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalSales = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Count products & low stock
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 },
        isActive: true,
      },
      include: {
        category: true,
        images: { where: { isMain: true } },
      },
      take: 5,
    });
    const lowStockCount = await prisma.product.count({
      where: { stock: { lte: 10 }, isActive: true },
    });

    // 3. Count customers
    const totalCustomers = await prisma.customer.count();

    // 4. Status breakdown
    const statusCounts = {
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };

    // 5. Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      lowStockProducts,
      statusCounts,
      recentOrders,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإحصائيات' }, { status: 500 });
  }
}
