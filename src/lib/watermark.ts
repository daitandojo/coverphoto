import sharp from "sharp";

const WATERMARK_TEXT = "Made with PortraitStudio";

export async function applyWatermark(
  imageBuffer: Buffer,
  paid: boolean
): Promise<Buffer> {
  if (paid) return imageBuffer;

  // Create watermark SVG overlay
  const svg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none"/>
      <text
        x="50%"
        y="96%"
        text-anchor="middle"
        font-family="DM Mono, monospace"
        font-size="24"
        fill="rgba(200, 185, 154, 0.5)"
        letter-spacing="4"
      >${WATERMARK_TEXT}</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

  return sharp(imageBuffer)
    .composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
}
