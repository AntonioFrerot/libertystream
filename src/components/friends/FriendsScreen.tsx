"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Gift, MessageCircle, Search, UserMinus, UserPlus } from "lucide-react";
import { TipModal } from "@/components/modals/TipModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useOpenInbox } from "@/lib/inbox/useOpenInbox";
import { useToast } from "@/components/ui/Toast";
import { searchUsers, friendAvatar } from "@/lib/friends/searchUsers";
import type { FriendEntry, UserSearchResult } from "@/lib/friends/types";
import type { TranslationKey } from "@/lib/i18n/translations";

export function FriendsScreen() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const openInbox = useOpenInbox();
  const searchParams = useSearchParams();
  const { user, addFriend, removeFriend, isFriend } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [tipFriend, setTipFriend] = useState<FriendEntry | null>(null);
  const openedChatRef = useRef<string | null>(null);

  const friends = user?.friends ?? [];

  const friendEntries = useMemo(
    () =>
      friends.map((friend) => ({
        ...friend,
        avatar: friendAvatar(friend),
      })),
    [friends],
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");
    const sync = () => setMobileSearch(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const slug = searchParams.get("chat");
    if (!slug || !user) {
      openedChatRef.current = null;
      return;
    }
    const normalized = slug.toLowerCase();
    if (openedChatRef.current === normalized) return;
    const match = friends.find((friend) => friend.slug === normalized);
    if (!match) return;
    openedChatRef.current = normalized;
    openInbox("messages", {
      userId: match.userId,
      username: match.username,
      slug: match.slug,
      avatar: friendAvatar(match),
    });
  }, [searchParams, friends, user, openInbox]);

  useEffect(() => {
    if (!user || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      const next = await searchUsers(query, user.id);
      setResults(next.filter((result) => !isFriend(result.slug)));
      setSearching(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, user, isFriend]);

  const handleAddFriend = useCallback(
    (result: UserSearchResult) => {
      const errKey = addFriend({
        userId: result.userId,
        username: result.username,
        slug: result.slug,
      });
      if (errKey) {
        showToast(t(errKey as TranslationKey));
        return;
      }
      showToast(t("friendsAdded", { name: result.username }));
      setResults((items) => items.filter((item) => item.slug !== result.slug));
    },
    [addFriend, showToast, t],
  );

  if (!user) {
    return (
      <div className="friends-auth-empty">
        <p className="text-sm text-white/55">{t("friendsLoginRequired")}</p>
        <Link href="/" className="btn-kick px-5 py-2 text-sm">
          {t("home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-page-head">
        <h1 className="font-display text-2xl font-bold text-white">{t("menuFriends")}</h1>
        <p className="text-sm text-white/50 mt-1">{t("friendsSubtitle")}</p>
      </div>

      <div className="friends-search-card">
        <label className="friends-search-label" htmlFor="friends-search">
          <Search className="w-4 h-4 text-white/40" />
          <span>{t("friendsSearchLabel")}</span>
        </label>
        <div className="friends-search-field">
          <Search className="friends-search-field-icon" aria-hidden />
          <input
            id="friends-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mobileSearch ? t("search") : t("friendsSearchPlaceholder")}
            className="friends-search-input"
            autoComplete="off"
          />
        </div>
        {searching && <p className="friends-search-hint">{t("friendsSearching")}</p>}
        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <p className="friends-search-hint">{t("friendsNoResults")}</p>
        )}
        {results.length > 0 && (
          <ul className="friends-search-results">
            {results.map((result) => (
              <li key={result.slug} className="friends-search-item">
                <Image
                  src={result.avatar}
                  alt={result.username}
                  width={44}
                  height={44}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{result.username}</p>
                  {result.displayName && (
                    <p className="text-xs text-white/45 truncate">{result.displayName}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="friends-add-btn"
                  onClick={() => handleAddFriend(result)}
                  aria-label={t("friendsAdd")}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="friends-action-btn-text">{t("friendsAdd")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="friends-list-section">
        <h2 className="friends-list-title">
          {t("friendsListTitle")} ({friendEntries.length})
        </h2>
        {friendEntries.length === 0 ? (
          <p className="text-sm text-white/45">{t("friendsEmpty")}</p>
        ) : (
          <ul className="friends-list">
            {friendEntries.map((friend) => (
              <li key={friend.slug} className="friends-list-item">
                <Link href={`/${friend.slug}`} className="friends-list-profile">
                  <Image
                    src={friend.avatar}
                    alt={friend.username}
                    width={48}
                    height={48}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{friend.username}</p>
                    <p className="text-xs text-white/40 truncate">/{friend.slug}</p>
                  </div>
                </Link>
                <div className="friends-list-actions">
                  <button
                    type="button"
                    className="friends-action-btn"
                    aria-label={t("friendsMessage")}
                    onClick={() =>
                      openInbox("messages", {
                        userId: friend.userId,
                        username: friend.username,
                        slug: friend.slug,
                        avatar: friend.avatar,
                      })
                    }
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="friends-action-btn-text">{t("friendsMessage")}</span>
                  </button>
                  <button
                    type="button"
                    className="friends-action-btn friends-action-btn-tip"
                    aria-label={t("friendsTip")}
                    onClick={() => setTipFriend(friend)}
                  >
                    <Gift className="w-4 h-4" />
                    <span className="friends-action-btn-text">{t("friendsTip")}</span>
                  </button>
                  <button
                    type="button"
                    className="friends-action-btn friends-action-btn-remove"
                    onClick={() => removeFriend(friend.slug)}
                    aria-label={t("friendsRemove")}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tipFriend && (
        <TipModal
          open={tipFriend != null}
          onClose={() => setTipFriend(null)}
          streamerName={tipFriend.username}
          streamerUsername={tipFriend.slug}
          recipientUserId={tipFriend.userId}
        />
      )}
    </div>
  );
}
