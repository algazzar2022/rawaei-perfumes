import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingGovernorate,
      shippingCity,
      shippingAddress,
      shippingMethod = 'standard',
      paymentMethod = 'instapay',
      transferSenderPhone,
      items,
      couponCode,
      customerNotes,
    } = body;

    const fullCity = shippingGovernorate
      ? `${shippingGovernorate} - ${shippingCity || ''}`.trim()
      : (shippingCity || '').trim();

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !fullCity ||
      !shippingAddress ||
      !items ||
      !items.length
    ) {
      return NextResponse.json(
        { error: 'يرجى استكمال جميع بيانات العميل والتوصيل المطلوبة (المحافظة، المدينة، والعنوان التفصيلي)' },
        { status: 400 }
      );
    }

    if (!transferSenderPhone?.trim()) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتفك أو محفظتك المحول منها لتأكيد الطلب' },
        { status: 400 }
      );
    }

    // Verify products and compute subtotal
    let subtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { sizes: true },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `المنتج (${item.product?.nameAr || item.productId}) غير متوفر حالياً` },
          { status: 400 }
        );
      }

      // Find price for size
      const sizeObj = product.sizes.find((s) => s.sizeMl === item.sizeMl);
      const unitPrice = sizeObj ? sizeObj.price : product.price;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const itemTotal = unitPrice * quantity;

      subtotal += itemTotal;

      verifiedOrderItems.push({
        productId: product.id,
        productNameAr: product.nameAr,
        productNameEn: product.nameEn,
        sizeMl: item.sizeMl || product.volumeMl || 100,
        unitPrice,
        quantity,
        totalPrice: itemTotal,
      });

      // Decrease stock if available
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (sizeObj) {
        await prisma.productSize.update({
          where: { id: sizeObj.id },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }
    }

    // Check Coupon
    let discountAmount = 0;
    let validatedCoupon = null;
    if (couponCode) {
      validatedCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (validatedCoupon && validatedCoupon.isActive) {
        if (!validatedCoupon.expiresAt || new Date(validatedCoupon.expiresAt) >= new Date()) {
          if (!validatedCoupon.usageLimit || validatedCoupon.usedCount < validatedCoupon.usageLimit) {
            if (!validatedCoupon.minOrderValue || subtotal >= validatedCoupon.minOrderValue) {
              if (validatedCoupon.discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * validatedCoupon.discountValue) / 100;
                if (validatedCoupon.maxDiscount && discountAmount > validatedCoupon.maxDiscount) {
                  discountAmount = validatedCoupon.maxDiscount;
                }
              } else {
                discountAmount = validatedCoupon.discountValue;
              }
              if (discountAmount > subtotal) discountAmount = subtotal;

              // Increment coupon usage
              await prisma.coupon.update({
                where: { id: validatedCoupon.id },
                data: { usedCount: { increment: 1 } },
              });
            }
          }
        }
      }
    }

    // Lookup governorate shipping from database
    let shippingCost = subtotal >= 800 ? 0 : 50;
    let shippingMethodName = shippingGovernorate ? `شحن إلى ${shippingGovernorate}` : 'توصيل محلي داخل مصر';

    if (shippingGovernorate) {
      const govMethod = await prisma.shippingMethod.findFirst({
        where: {
          OR: [
            { nameAr: shippingGovernorate.trim() },
            { nameAr: { contains: shippingGovernorate.trim() } },
            { id: `gov-${shippingGovernorate.trim()}` },
          ],
          isActive: true,
        },
      });

      if (govMethod) {
        const freeAbove = govMethod.freeShippingAbove !== null && govMethod.freeShippingAbove !== undefined
          ? govMethod.freeShippingAbove
          : 800;
        if (subtotal >= freeAbove) {
          shippingCost = 0;
        } else {
          shippingCost = govMethod.cost;
        }
        shippingMethodName = `${govMethod.nameAr}${govMethod.estimatedDays ? ` (${govMethod.estimatedDays})` : ''}`;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

    // Generate unique order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RW-2026-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Get current logged-in user if any
    const userPayload = await getCurrentUser();

    // Create or find customer
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [{ email: customerEmail.toLowerCase().trim() }, { phone: customerPhone.trim() }],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName.trim(),
          email: customerEmail.toLowerCase().trim(),
          phone: customerPhone.trim(),
          city: fullCity,
          totalOrders: 1,
          totalSpent: totalAmount,
          userId: userPayload?.userId || null,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: totalAmount },
          city: fullCity,
        },
      });
    }

    // Save Address
    await prisma.address.create({
      data: {
        customerId: customer.id,
        title: 'عنوان التوصيل',
        recipientName: customerName.trim(),
        phone: customerPhone.trim(),
        city: fullCity,
        addressLine: shippingAddress.trim(),
        isDefault: true,
      },
    });

    const paymentMethodDisplay =
      paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'انستاباي (InstaPay)';

    const combinedNotes = `${customerNotes ? customerNotes + ' | ' : ''}[تحويل إلكتروني]: ${paymentMethodDisplay} - رقم الهاتف المحول منه: ${transferSenderPhone}`;

    const actualPaymentMethod = paymentMethod === 'vodafone_cash' ? 'vodafone_cash' : 'instapay';

    // Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        userId: userPayload?.userId || null,
        status: 'PENDING',
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone.trim(),
        shippingCity: fullCity,
        shippingAddress: shippingAddress.trim(),
        shippingMethod: shippingMethodName,
        paymentMethod: actualPaymentMethod,
        paymentStatus: 'PENDING',
        subtotal,
        discountAmount,
        shippingCost,
        taxAmount: 0,
        totalAmount,
        couponCode: validatedCoupon ? validatedCoupon.code : null,
        customerNotes: combinedNotes,
        adminNotes: `تحويل ${paymentMethodDisplay} من رقم: ${transferSenderPhone}`,
        items: {
          create: verifiedOrderItems,
        },
        payments: {
          create: {
            method: actualPaymentMethod,
            status: 'PENDING',
            amount: totalAmount,
            transactionId: `TRANSFER-${transferSenderPhone}`,
            rawResponse: JSON.stringify({
              paymentMethod: actualPaymentMethod,
              transferSenderPhone,
            }),
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      totalAmount: order.totalAmount,
      message: 'تم تأكيد طلبك بنجاح وسنتواصل معك للشحن!',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إتمام الطلب' },
      { status: 500 }
    );
  }
}
