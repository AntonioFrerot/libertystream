import { notFound } from "next/navigation";
import { getClipById, topClipsOfWeek } from "@/lib/data";
import { ClipPageClient } from "@/components/clips/ClipPageClient";

export function generateStaticParams() {
  return topClipsOfWeek.map((c) => ({ id: c.id }));
}

export default async function ClipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clip = getClipById(id);
  if (!clip) notFound();
  return <ClipPageClient clip={clip} />;
}
