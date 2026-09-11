import { getStreamerByUsername, getCategoryById } from "@/lib/data";
import { StreamPageClient } from "@/components/stream/StreamPageClient";
import { ChannelPageClient } from "@/components/channel/ChannelPageClient";

interface Props {
  params: Promise<{ username: string }>;
}

export const dynamicParams = true;

export default async function ChannelPage({ params }: Props) {
  const { username } = await params;
  const slug = username.toLowerCase();

  const known = getStreamerByUsername(slug);
  if (known) {
    return <StreamPageClient streamer={known} category={getCategoryById(known.category)} />;
  }

  return <ChannelPageClient slug={slug} />;
}
