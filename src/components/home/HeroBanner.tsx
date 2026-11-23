'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { BannerDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface HeroBannerProps {
  initialBanner?: BannerDto | null;
}

export default function HeroBanner({ initialBanner }: HeroBannerProps) {
  const { direction } = useLanguage();
  const [banner, setBanner] = useState<BannerDto | null>(initialBanner || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live banner data if not passed or to reflect admin updates
  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        const hero = data.banners?.find((b: any) => b.type === 'HERO' && b.isActive);
        if (hero) setBanner(hero);
      } catch (err) {
        console.error('Failed to load hero banner', err);
      }
    }
    if (!initialBanner) {
      fetchBanner();
    }
  }, [initialBanner]);

  const slides = banner?.slides?.filter((s) => s.isActive) || [];

  // Slideshow timer
  useEffect(() => {
    if (!banner || banner.mode !== 'SLIDESHOW' || slides.length <= 1 || isPaused) return;

    const currentSlide = slides[currentSlideIndex];
    const duration = (currentSlide?.durationSeconds || 5) * 1000;

    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [banner, slides, currentSlideIndex, isPaused]);

  if (!banner || !banner.isActive) {
    return null;
  }

  const isRtl = direction === 'rtl';

  const nextSlide = () => {
    if (slides.length > 1) {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 1) {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <section
      className="relative w-full h-[280px] sm:h-[400px] md:h-[460px] lg:h-[500px] overflow-hidden bg-black select-none shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ============================================================== */}
      {/* 1. SLIDESHOW MODE (Clean, No Text, No Buttons, Pure Visuals)   */}
      {/* ============================================================== */}
      {banner.mode === 'SLIDESHOW' && slides.length > 0 && (
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            {slides.map((slide, index) => {
              if (index !== currentSlideIndex) return null;
              const targetLink = slide.link || banner.link || '/perfumes';

              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Link href={targetLink} className="block w-full h-full relative cursor-pointer">
                    {/* Banner Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={slide.desktopImage || slide.mobileImage || '/logo.png'}
                        alt="روائع للعطور"
                        fill
                        priority={index === 0}
                        className="object-cover object-center"
                        sizes="100vw"
                      />
                    </div>

                    {/* Subtle Luxury Gradient Overlay for Depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation Arrows for Slideshow */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-6 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-[#C49A45] hover:text-black text-white border border-white/20 hover:border-[#C49A45] flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-6 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-[#C49A45] hover:text-black text-white border border-white/20 hover:border-[#C49A45] flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentSlideIndex
                        ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-gradient-to-r from-[#DFC27A] to-[#C49A45]'
                        : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STATIC IMAGE MODE                                           */}
      {/* ============================================================== */}
      {banner.mode === 'STATIC' && (
        <Link href={banner.link || '/perfumes'} className="block relative w-full h-full cursor-pointer">
          {/* Banner Image */}
          <div className="absolute inset-0">
            <Image
              src={banner.desktopImage || banner.mobileImage || '/logo.png'}
              alt="روائع للعطور"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </Link>
      )}

      {/* ============================================================== */}
      {/* 3. VIDEO MODE                                                  */}
      {/* ============================================================== */}
      {banner.mode === 'VIDEO' && banner.videoUrl && (
        <div className="relative w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={banner.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
      )}
    </section>
  );
}
