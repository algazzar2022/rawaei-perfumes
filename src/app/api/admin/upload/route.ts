import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subFolder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم تحديد أي ملف للرفع' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'الملف المختار يجب أن يكون صورة أو فيديو' }, { status: 400 });
    }

    // Limit checks: Images max 25MB, Videos max 100MB
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `حجم الملف كبير جداً. الحد الأقصى: ${isVideo ? '100 ميجابايت' : '25 ميجابايت'}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. If Cloudinary credentials exist, upload to Cloudinary into dedicated folder 'rawaei-perfumes'
    if (cloudName && apiKey && apiSecret) {
      const folderPath = `rawaei-perfumes/${subFolder}`;

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: isVideo ? 'video' : 'image',
            overwrite: true,
            // Automatic optimization
            transformation: isVideo
              ? [{ quality: 'auto', fetch_format: 'auto' }]
              : [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        folder: folderPath,
        provider: 'cloudinary',
      });
    }

    // 2. Fallback if Cloudinary is not yet configured:
    // Inform the admin and provide instructions or base64 preview for instant testing
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64,
      provider: 'local_preview',
      warning:
        'لم يتم العثور على مفاتيح Cloudinary في متغيرات البيئة. تم استخدام المعاينة المحلية مؤقتاً. يرجى إضافة CLOUDINARY_CLOUD_NAME و CLOUDINARY_API_KEY و CLOUDINARY_API_SECRET.',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}
