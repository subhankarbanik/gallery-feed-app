"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryCard, Tag } from "@/lib/types";

type GalleriesResponse = {
  items: GalleryCard[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

const TAG_ALL = "all";

export default function GalleryFeedPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>(TAG_ALL);
  const [galleries, setGalleries] = useState<GalleryCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) {
          throw new Error("Failed to load tags");
        }
        const data = (await res.json()) as { tags: Tag[] };
        setTags(data.tags);
      } catch (e) {
        console.error(e);
      }
    };

    loadTags();
  }, []);

  useEffect(() => {
    const loadFirstPage = async () => {
      setIsInitialLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/galleries?tag=${encodeURIComponent(selectedTag)}&page=1`
        );
        if (!res.ok) {
          throw new Error("Failed to load galleries");
        }
        const data = (await res.json()) as GalleriesResponse;
        setGalleries(data.items);
        setPage(1);
        setHasMore(data.hasMore);
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading galleries.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadFirstPage();
  }, [selectedTag]);

  useEffect(() => {
    if (!hasMore) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isInitialLoading && !isLoadingMore) {
          loadNextPage();
        }
      },
      {
        rootMargin: "200px",
      }
    );

    const current = sentinelRef.current;
    if (current) {
      observerRef.current.observe(current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isInitialLoading, isLoadingMore, selectedTag]);

  const loadNextPage = async () => {
    if (!hasMore) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/galleries?tag=${encodeURIComponent(selectedTag)}&page=${nextPage}`
      );
      if (!res.ok) {
        throw new Error("Failed to load more galleries");
      }
      const data = (await res.json()) as GalleriesResponse;
      setGalleries((prev) => [...prev, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (e) {
      console.error(e);
      setError("Something went wrong while loading more galleries.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleTagClick = (tagValue: string) => {
    if (tagValue === selectedTag) return;
    setSelectedTag(tagValue);
  };

  const allTagChip = {
    id: 0,
    tag: TAG_ALL,
    tag_display_name: "All",
  };

  const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Gallery
          </h1>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[allTagChip, ...tags].map((tag) => {
              const isActive =
                (tag.tag === TAG_ALL && selectedTag === TAG_ALL) ||
                tag.tag === selectedTag;
              return (
                <button
                  key={tag.id ?? tag.tag}
                  type="button"
                  onClick={() => handleTagClick(tag.tag)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {tag.tag_display_name}
                </button>
              );
            })}
          </div>
        </header>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {isInitialLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse rounded-xl bg-neutral-200"
              />
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center text-neutral-500">
            <p className="text-base font-medium">
              No galleries found for this tag.
            </p>
            <p className="mt-1 text-sm">
              Try switching to a different category.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
              {galleries.map((item) => (
                <Link
                  key={item.id}
                  href={`/gallery/${item.id}`}
                  className="group relative block overflow-hidden rounded-xl bg-neutral-200"
                >
                  <div className="relative h-full w-full">
                    {/* <Image
                      src={item.media_url}
                      alt={item.profile_name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={true}
                    /> */}
                    <img src={item.media_url} alt="" className="w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  </div>
                </Link>
              ))}
            </section>

            <section className="mt-6 text-sm text-neutral-500">
              <p>
                Showing {galleries.length}{" "}
                {selectedTag === TAG_ALL
                  ? "photos"
                  : `photos for “${
                      tags.find((t) => t.tag === selectedTag)?.tag_display_name ??
                      selectedTag
                    }”`}
                .
              </p>
              {galleries[0] && (
                <p className="mt-1">
                  Latest updated on{" "}
                  {dateFormatter.format(new Date(galleries[0].created_at))}
                </p>
              )}
            </section>
          </>
        )}

        <div ref={sentinelRef} className="h-8 w-full" />

        {isLoadingMore && (
          <div className="flex justify-center py-4 text-sm text-neutral-500">
            Loading more photos…
          </div>
        )}

        {!hasMore && galleries.length > 0 && (
          <div className="flex justify-center py-6 text-xs text-neutral-400">
            You&apos;ve reached the end.
          </div>
        )}
      </main>
    </div>
  );
}

