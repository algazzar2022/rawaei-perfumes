'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, CheckCircle, AlertCircle, X, Sparkles, Film, Image as ImageIcon, Loader2, Link2 } from 'lucide-react';
import { compressImage, formatBytes } from '@/lib/imageCompression';

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  acceptType?: 'image' | 'video' | 'any';
  folder?: string;
  placeholder?: string;
}

export default function MediaUploader({
  label,
  value,
  onChange,
  acceptType = 'image',
  folder = 'products',
  placeholder = 'https://...',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{
    original: string;
    compressed: string;
    saved: number;
  } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setCompressionInfo(null);

    try {
      let fileToUpload = file;

      // 1. If it's an image, compress it in the browser first!
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 1600, 1600, 0.82);
        fileToUpload = compressed.file;

        if (compressed.savedPercent > 0) {
          setCompressionInfo({
            original: formatBytes(compressed.originalSize),
            compressed: formatBytes(compressed.compressedSize),
            saved: compressed.savedPercent,
          });
        }
      }

      // 2. Upload to Cloudinary backend route
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل رفع الملف إلى السيرفر');
      }

      if (data.url) {
        onChange(data.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('video/upload'));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-black font-black flex items-center gap-1.5">
          {acceptType === 'video' ? (
            <Film className="w-3.5 h-3.5 text-black" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-black" />
          )}
          <span>{label}</span>
        </label>

        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-[11px] text-[#98702B] hover:underline font-bold flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{manualMode ? 'الرفع المباشر من الجهاز' : 'كتابة رابط يدوي'}</span>
        </button>
      </div>

      {manualMode ? (
        <input
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#FAF8F5] border border-[#DFC27A]/50 rounded-xl px-3 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-[#C49A45]"
        />
      ) : (
        <div className="space-y-2">
          {/* Upload Area / Current Preview */}
          {value ? (
            <div className="p-3 rounded-2xl bg-white border border-[#DFC27A]/40 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-[#DFC27A]/30 flex-shrink-0">
                  {isVideo ? (
                    <video src={value} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={value} alt="معاينة" fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم تحديد الملف بنجاح</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 truncate max-w-xs font-mono dir-ltr text-left">
                    {value}
                  </p>
                  {compressionInfo && (
                    <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
                      ⚡ تم ضغط الصورة من {compressionInfo.original} إلى {compressionInfo.compressed} (وفر {compressionInfo.saved}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
                >
                  تغيير
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setCompressionInfo(null);
                  }}
                  className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                  title="حذف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed border-[#DFC27A]/60 bg-[#FAF7F2] hover:bg-white hover:border-[#C49A45] cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <div className="space-y-1.5">
                  <Loader2 className="w-8 h-8 text-[#98702B] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-black">جاري ضغط الملف ورفعه إلى Cloudinary...</p>
                  <span className="text-[10px] text-neutral-600">يتم ضغط الحجم لضمان السرعة الفائقة</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#C49A45]/20 text-[#98702B] flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-black">
                      اضغط لاختيار {acceptType === 'video' ? 'فيديو' : 'صورة'} من جهازك
                    </p>
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                      {acceptType === 'video'
                        ? 'يدعم MP4, WebM (يتم تحسين وبث الفيديو عبر Cloudinary)'
                        : 'يتم ضغط أي صورة مهما كان حجمها فورياً في المتصفح قبل الرفع'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={
              acceptType === 'video'
                ? 'video/mp4,video/webm,video/*'
                : acceptType === 'image'
                ? 'image/jpeg,image/png,image/webp,image/avif,image/*'
                : 'image/*,video/*'
            }
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}
    </div>
  );
}
