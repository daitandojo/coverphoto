import sharp from "sharp";

export async function applyWatermark(
  imageBuffer: Buffer,
  _paid: boolean
): Promise<Buffer> {
  // No watermark per product spec
  return imageBuffer;
}
