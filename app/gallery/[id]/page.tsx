import Image from "next/image";
import Link from "next/link";
import type { GalleryDetail, GalleryCard } from "@/lib/types";

async function getGallery(id: string): Promise<GalleryDetail | null> {
  if (!id) return null;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/galleries/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as GalleryDetail;
}

async function getSimilar(id: string): Promise<GalleryCard[]> {
  if (!id) return [];
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/galleries/${id}/similar`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { items: GalleryCard[] };
  console.log('Subhankar Data');
  return data.items;
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  
  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-neutral-900">
            Invalid gallery ID
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex  bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  const [gallery, similar] = await Promise.all([
    getGallery(id),
    getSimilar(id),
  ]);

  if (!gallery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-neutral-900">
            Gallery not found
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            The photo you&apos;re looking for may have been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to gallery
          </Link>
        </div>
      </div>
      
    );
  }

  const postedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(gallery.created_at));

  const primaryTag = gallery.tags[0];

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      <main className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200"
          >
            <span className="sr-only">Back</span>
            <span className="text-lg text-neutral-700 mb-1">←</span>
          </Link>
        </header>

        <section className="overflow-hidden  bg-gradient-to-b from-neutral-100 to-neutral-200">
          <div className="relative aspect-[3/4] w-full sm:aspect-[16/10]">
            <Image
              src={gallery.media_url}
              alt={gallery.profile_name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-full w-full object-cover"
              unoptimized={true}
            />
          {/* <img
            src={gallery.media_url}
            alt={gallery.profile_name}
            className="h-full w-full object-cover"
          /> */}
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4 bg-[#FAFAFA] px-4 py-4  ring-1 ring-neutral-100 sm:flex-row sm:items-center sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden bg-neutral-200 rounded-xl">
              {gallery.profile_picture && (
                <Image
                  src={gallery.profile_picture}
                  alt={gallery.profile_name}
                  fill
                  sizes="48px"
                  className="h-full w-full object-fit"
                  unoptimized={true}
                />
              
                // <img
                //    src={gallery.profile_picture}
                //    alt={gallery.profile_name}
                //    className="h-full w-full object-cover rounded-xl"
                // />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {gallery.profile_name}
              </p>
              <p className="text-xs text-neutral-500">
                {gallery.total_photo_uploaded ?? 0} Site photos
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2 text-xs">
              {gallery.tags.map((tag) => (
                <span
                  key={tag.id}
                  className=" bg-neutral-100 px-3 py-1 text-neutral-700"
                >
                  #{tag.tag_display_name}
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-500">Posted on {postedDate}</p>
          </div>
        </section>

        {similar.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-neutral-900">
              Similar images{primaryTag ? ` · ${primaryTag.tag_display_name}` : ""}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {similar.map((item) => (
                <Link
                  key={item.id}
                  href={`/gallery/${item.id}`}
                  className="group relative block overflow-hidden bg-neutral-200"
                >
                  <div className="relative h-full w-full">
                    {/* <Image
                      src={item.media_url}
                      alt={item.profile_name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={true}
                    /> */}
                       <img
                         src={item.media_url}
                         alt={item.profile_name}
                         className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                       />

                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
    
  );
}


