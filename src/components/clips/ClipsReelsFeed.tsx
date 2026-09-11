"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  MessageCircle,
  Play,
  Send,
  Share2,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { topClipsOfWeek, type Clip } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { ClipsScrollRail } from "@/components/clips/ClipsScrollRail";

function ReelActionButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 w-14 transition-colors ${
        active ? "text-kick-green" : "text-white/80 hover:text-kick-green"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
          active
            ? "bg-kick-green/15 border-kick-green/40"
            : "bg-kick-surface/90 border-kick-border hover:border-kick-green/40 hover:bg-kick-hover"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium text-center w-full leading-tight">
        {count ?? label}
      </span>
    </button>
  );
}

function ClipReelSlide({
  clip,
  index,
  total,
  isActive,
  onVisible,
}: {
  clip: Clip;
  index: number;
  total: number;
  isActive: boolean;
  onVisible: (index: number) => void;
}) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { follow, isFollowing, requireAuth } = useRequireAuth();
  const { openAuth } = useAppUI();
  const slideRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(clip.views / 40));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: "1", user: "Fan_42", text: "Incroyable ce moment 🔥" },
    { id: "2", user: "ViewerX", text: "Meilleur clip de la semaine" },
  ]);

  const following = isFollowing(clip.streamerUsername);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          onVisible(index);
        }
      },
      { threshold: [0.55, 0.75] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    videoRef.current && (videoRef.current.muted = muted);
  }, [muted]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/clip/${clip.id}`);
      showToast(t("linkCopied"));
    } catch {
      showToast(t("linkCopyFail"));
    }
  };

  const handleFollow = () => {
    requireAuth(() => {
      const wasFollowing = following;
      follow(clip.streamerUsername);
      showToast(
        wasFollowing
          ? t("unfollowSuccess", { name: clip.streamerName })
          : t("followSuccess", { name: clip.streamerName })
      );
    }, () => openAuth("login"));
  };

  const handleLike = () => {
    requireAuth(() => {
      setLiked((prev) => {
        setLikeCount((c) => (prev ? c - 1 : c + 1));
        return !prev;
      });
    }, () => openAuth("login"));
  };

  const handleCommentSubmit = () => {
    const text = commentText.trim();
    if (!text) return;
    requireAuth(() => {
      setComments((prev) => [
        { id: String(Date.now()), user: "Vous", text },
        ...prev,
      ]);
      setCommentText("");
      showToast(t("clipCommentSent"));
    }, () => openAuth("login"));
  };

  return (
    <section ref={slideRef} className="clips-reel-slide">
      <div className="relative clips-reel-video w-full h-full bg-black group">
        <video
          ref={videoRef}
          src={clip.videoUrl}
          poster={clip.thumbnail}
          loop
          playsInline
          muted={muted}
          preload={index <= 1 ? "auto" : "metadata"}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
          }}
          onClick={togglePlay}
        />

        {!playing && isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-kick-green transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label={muted ? t("unmute") : t("mute")}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-16 pointer-events-none">
          <div className="pointer-events-auto max-w-[calc(100%-5rem)]">
            <Link
              href={`/${clip.streamerUsername}`}
              className="relative inline-block mb-2 group/avatar"
              title={clip.streamerName}
            >
              <Image
                src={clip.streamerAvatar}
                alt={clip.streamerName}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-kick-green/50 group-hover/avatar:ring-kick-green object-cover transition-all"
              />
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/${clip.streamerUsername}`}
                className="text-sm font-semibold hover:text-kick-green transition-colors"
              >
                {clip.streamerName}
              </Link>
              <button
                type="button"
                onClick={handleFollow}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                  following
                    ? "bg-kick-green/15 border border-kick-green/40 text-kick-green hover:bg-kick-green/25"
                    : "bg-kick-green text-white hover:bg-kick-green/90"
                }`}
              >
                {following ? t("alreadyFollowing") : t("follow")}
              </button>
            </div>
            <p className="text-[11px] text-white/50 mb-1">{getCategoryLabel(t, clip.category)}</p>
            <p className="text-sm font-medium leading-snug line-clamp-2">{clip.title}</p>
            <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(clip.views)} {t("views")} · {clip.duration}
            </p>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto z-10">
          <ReelActionButton
            icon={<ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />}
            label={t("like")}
            count={formatNumber(likeCount)}
            active={liked}
            onClick={handleLike}
          />
          <ReelActionButton
            icon={<MessageCircle className="w-5 h-5" />}
            label={t("comment")}
            count={String(comments.length)}
            active={commentsOpen}
            onClick={() => setCommentsOpen((o) => !o)}
          />
          <ReelActionButton icon={<Share2 className="w-5 h-5" />} label={t("share")} onClick={handleShare} />
        </div>

        {commentsOpen && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-kick-surface/95 border-t border-kick-border backdrop-blur-md pointer-events-auto max-h-[45%] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-kick-border">
              <h3 className="text-sm font-semibold">{t("clipComments")}</h3>
              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                className="p-1.5 rounded-md hover:bg-kick-hover transition-colors text-white/50 hover:text-white"
                aria-label={t("close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-semibold text-kick-green mr-2">{c.user}</span>
                  <span className="text-white/80">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-kick-border flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("clipCommentPlaceholder")}
                className="flex-1 px-3 py-2 rounded-lg bg-kick-bg border border-kick-border text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-kick-green/40"
                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
              />
              <button
                type="button"
                onClick={handleCommentSubmit}
                className="p-2.5 rounded-lg bg-kick-green text-white hover:bg-kick-green/90 transition-colors"
                aria-label={t("sendMessage")}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ClipsReelsFeed() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const clips = useMemo(
    () => [...topClipsOfWeek].sort((a, b) => b.views - a.views),
    []
  );

  const handleVisible = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, clips.length - 1));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
    setActiveIndex(clamped);
  }, [clips.length]);

  const scrollPrev = () => scrollToIndex(activeIndex - 1);
  const scrollNext = () => scrollToIndex(activeIndex + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, scrollToIndex]);

  return (
    <div className="clips-feed">
      <div className="clips-feed-viewport">
        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <h1 className="font-display text-lg font-bold">{t("clips")}</h1>
          <p className="text-xs text-white/50">{t("clipsReelsDesc")}</p>
        </div>

        <div
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-y-contain"
        >
          {clips.map((clip, index) => (
            <ClipReelSlide
              key={clip.id}
              clip={clip}
              index={index}
              total={clips.length}
              isActive={activeIndex === index}
              onVisible={handleVisible}
            />
          ))}
        </div>
      </div>

      <ClipsScrollRail
        onScrollUp={scrollPrev}
        onScrollDown={scrollNext}
        canScrollUp={activeIndex > 0}
        canScrollDown={activeIndex < clips.length - 1}
      />
    </div>
  );
}
