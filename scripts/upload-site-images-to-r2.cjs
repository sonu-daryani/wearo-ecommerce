/**
 * Upload homepage hero + dress-style PNGs from public/images to R2 and upsert CmsSiteAsset rows.
 *
 * Run: npm run upload:r2-site
 */
require("./load-env.cjs");

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** public/images filename → CmsSiteAsset.key */
const FILES = [
  { file: "header-homepage.png", key: "hero-desktop" },
  { file: "header-res-homepage.png", key: "hero-mobile" },
  { file: "dress-style-1.png", key: "dress-style-1" },
  { file: "dress-style-2.png", key: "dress-style-2" },
  { file: "dress-style-3.png", key: "dress-style-3" },
  { file: "dress-style-4.png", key: "dress-style-4" },
];

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const endpoint = requireEnv("R2_ENDPOINT");
  const bucket = requireEnv("R2_BUCKET");
  const publicBase = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL (or mongodb_uri in .env) required.");
    process.exit(1);
  }

  console.log(`Uploading ${FILES.length} site images to s3://${bucket}/site/ …`);

  for (const { file, key } of FILES) {
    const local = path.join(process.cwd(), "public", "images", file);
    if (!fs.existsSync(local)) {
      console.error(`Missing file: ${local}`);
      process.exit(1);
    }
    const r2Key = `site/${file}`;
    const ext = path.extname(file).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const body = fs.readFileSync(local);

    let exists = false;
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: r2Key }));
      exists = true;
    } catch {
      /* not found */
    }

    if (!exists) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: r2Key,
          Body: body,
          ContentType: contentType,
        })
      );
      console.log(`  put ${r2Key}`);
    } else {
      console.log(`  exists ${r2Key} (skip upload)`);
    }

    const imageUrl = `${publicBase}/${r2Key}`;
    await prisma.cmsSiteAsset.upsert({
      where: { key },
      create: { key, imageUrl },
      update: { imageUrl },
    });
    console.log(`  DB ${key} → ${imageUrl}`);
  }

  console.log("Done. Homepage will use these URLs (override /public defaults).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
