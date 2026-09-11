import Image from "next/image";

type MultiplayerIconProps = {
  className?: string;
};

export function MultiplayerIcon({ className }: MultiplayerIconProps) {
  return (
    <Image
      src="/icons/multiplayer.png"
      alt=""
      width={42}
      height={35}
      className={className}
      aria-hidden
      draggable={false}
    />
  );
}
