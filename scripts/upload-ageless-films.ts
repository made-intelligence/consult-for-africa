/**
 * The two AGELESS follow-up films, to the public media bucket.
 *
 *   npx tsx --env-file=.env.local scripts/upload-ageless-films.ts <dir>
 *
 * <dir> holds the films, already encoded as H.264 with faststart, and the
 * email thumbnails. --images uploads only the thumbnails. Fixed keys, so the page and the email can name them.
 * These are marketing films meant for the public, so the open bucket is fine.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, getPublicUrl } from "@/lib/r2";

// The films, and the play-button thumbnails the thank-you mail shows, which
// live here rather than on the site so a mail renders before a deploy.
const FILES: Record<string, string> = {
  "lyfeplace-film.mp4": "video/mp4",
  "medlyfe-film.mp4": "video/mp4",
  "lyfeplace-email.jpg": "image/jpeg",
  "medlyfe-email.jpg": "image/jpeg",
};

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Pass the folder holding the encoded films.");
  for (const [name, type] of Object.entries(FILES)) {
    if (process.argv.includes("--images") && type.startsWith("video")) continue;
    const key = `marketing/ageless/${name}`;
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME ?? "cfa-uploads",
      Key: key,
      Body: readFileSync(join(dir, name)),
      ContentType: type,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    console.log(await getPublicUrl(key));
  }
}

main();
