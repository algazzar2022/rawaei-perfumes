'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Sparkles, Star } from 'lucide-react';
import { VideoReviewDto } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface VideoReviewsSectionProps {
  initialReviews?: VideoReviewDto[];
}

export default function VideoReviewsSection({ initialReviews = [] }: VideoReviewsSectionProps) {
  const { language, direction, t } = useLanguage();
  const [reviews, setReviews] = useState<VideoReviewDto[]>(initialReviews);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/video-reviews');
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load video reviews:', err);
      }
    }
    if (!initialReviews.length) {
      loadReviews();
    }
  }, [initialReviews]);

  const isRtl = direction === 'rtl';

  const scrollTowardsLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollTowardsRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingVideoId === id) {
      video.pause();
      setPlayingVideoId(null);
    } else {
      // Pause previously playing video
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]?.pause();
      }
      video.play().catch(() => {});
      setPlayingVideoId(id);
    }
  };

  const toggleMute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    const nextState = !video.muted;
    video.muted = nextState;
    setMutedStates((prev) => ({ ...prev, [id]: nextState }));
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-[#C49A45]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#98702B] uppercase tracking-[0.2em]">
              <span className="w-5 sm:w-6 h-[1.5px] bg-[#C49A45]" />
              <span>{t('تجارب حقيقية · آراء موثقة', 'REAL PEOPLE · REAL IMPRESSIONS')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
              {t(
                'عطورنا.. كما يرويها عشاقها',
                'The scent, told by the people who wear it.'
              )}
            </h2>

            <p className="text-xs sm:text-base text-neutral-600 font-normal leading-relaxed">
              {t(
                'تجارب غير مصطنعة، واختبارات ثبات حقيقية، ولحظات صنعت لكل عطر ذكرى لا تُنسى في مختلف المناسبات.',
                'Unfiltered reactions, honest wear tests, and moments that made each fragrance memorable.'
              )}
            </p>
          </div>

          {/* Right Header Controls matching Image 1 */}
          <div className="flex items-center gap-3 sm:gap-4 self-start lg:self-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#C49A45]/30 text-[11px] sm:text-xs font-bold text-[#171717] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#C49A45] animate-pulse" />
              <span>{t('مراجعات فيديو مستقلة', 'Independent video reviews')}</span>
            </div>

            {/* Carousel navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollTowardsRight}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#C49A45] text-[#171717] hover:text-white border border-[#C49A45]/30 flex items-center justify-center transition-all shadow-sm active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={scrollTowardsLeft}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#C49A45] text-[#171717] hover:text-white border border-[#C49A45]/30 flex items-center justify-center transition-all shadow-sm active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Cards Grid / Carousel matching Image 1 vertical 9:16 layout without bottom scrollbar */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 pt-2 scrollbar-none no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((rev) => {
            const isPlaying = playingVideoId === rev.id;
            const isMuted = mutedStates[rev.id] !== undefined ? mutedStates[rev.id] : true;

            return (
              <div
                key={rev.id}
                onClick={() => togglePlay(rev.id)}
                className="group relative flex-shrink-0 w-[230px] sm:w-[270px] lg:w-[290px] h-[410px] sm:h-[480px] lg:h-[520px] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-black border-2 border-[#1E1E1E] hover:border-[#C49A45] transition-all duration-300 shadow-xl cursor-pointer snap-start flex flex-col justify-between p-4 sm:p-5"
              >
                {/* Background Poster Image */}
                <div className="absolute inset-0">
                  <Image
                    src={rev.posterImage}
                    alt={rev.authorName}
                    fill
                    className={`object-cover object-center transition-all duration-700 ${
                      isPlaying ? 'opacity-0' : 'group-hover:scale-105 opacity-100'
                    }`}
                    sizes="300px"
                  />

                  {/* Video Player */}
                  {rev.videoUrl && (
                    <video
                      ref={(el) => {
                        videoRefs.current[rev.id] = el;
                      }}
                      src={rev.videoUrl}
                      loop
                      muted={isMuted}
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  )}

                  {/* Glassmorphic Gradient Overlay for mobile reel styling */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                </div>

                {/* 1. Top Story Bar inside Card matching Image 1 */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#DFC27A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C49A45]" />
                      <span>{rev.badgeText || 'REAL REVIEW'}</span>
                    </span>
                  </div>

                  {rev.authorHandle && (
                    <span className="text-[11px] font-semibold text-white/90 drop-shadow" dir="ltr">
                      {rev.authorHandle}
                    </span>
                  )}
                </div>

                {/* Center Play Indicator */}
                {!isPlaying && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#C49A45]/90 hover:bg-[#C49A45] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </div>
                )}

                {/* Bottom Row matching Image 1: Author Name + Platform + Sound Toggle */}
                <div className="relative z-10 flex items-end justify-between pt-2">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white drop-shadow-md tracking-wide">
                      {rev.authorName}
                    </h4>
                    <span className="text-[10px] font-bold tracking-widest text-[#DFC27A] uppercase drop-shadow">
                      {rev.platform || 'REELS'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleMute(e, rev.id)}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-[#C49A45] hover:text-black border border-white/20 text-white flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
