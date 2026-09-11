import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../public/blackjack/suits");
const suits = ["heart", "diamond", "spade", "club"];

for (const name of suits) {
  const input = join(dir, `${name}-src.png`);
  const output = join(dir, `${name}.png`);

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = r + g + b;

    if (luminance < 28) {
      data[i + 3] = 0;
      continue;
    }

    if (luminance < 55 && Math.max(r, g, b) - Math.min(r, g, b) < 18) {
      const alpha = Math.round(((luminance - 28) / 27) * 255);
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(output);

  console.log(`Processed ${name}.png (${info.width}x${info.height})`);
}
