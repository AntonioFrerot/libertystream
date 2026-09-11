import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

/** Redirige /stream/{user} → /{user} (URL style Kick) */
export default async function LegacyStreamRedirect({ params }: Props) {
  const { username } = await params;
  redirect(`/${username}`);
}
