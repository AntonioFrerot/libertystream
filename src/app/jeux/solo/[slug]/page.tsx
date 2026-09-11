"use client";

import { useParams } from "next/navigation";
import { OriginalGameScreen } from "@/components/casino/OriginalGameScreen";

export default function SoloGamePage() {
  const params = useParams<{ slug: string }>();

  return <OriginalGameScreen slug={params.slug} backHref="/jeux" backLabelKey="gamesPageTitle" />;
}
