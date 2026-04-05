/**
 * Upload public/images used by the seed catalog to R2, then set product srcUrl/gallery to HTTPS URLs.
 *
 * Requires: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL, DATABASE_URL (or mongodb_uri in .env)
 *
 * Run: npm run upload:r2-catalog
 */
require("./load-env.cjs");

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { PrismaClient } = require("@prisma/client");
const { products } = require("./catalog-products.cjs");

const prisma = new PrismaClient();

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function collectImagePaths() {
  const set = new Set();
  for (const p of products) {
    if (p.srcUrl?.startsWith("/images/")) set.add(p.srcUrl);
    for (const g of p.gallery || []) {
      if (g.startsWith("/images/")) set.add(g);
    }
  }
  return [...set].sort();
}

function localFileForPublicPath(publicPath) {
  const rel = publicPath.replace(/^\//, "");
  return path.join(process.cwd(), "public", rel);
}

function r2KeyForPublicPath(publicPath) {
  const base = publicPath.replace(/^\/images\//, "");
  return `catalog/${base}`;
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

  const paths = collectImagePaths();
  const pathToUrl = new Map();

  console.log(`Uploading ${paths.length} files to s3://${bucket}/catalog/ …`);

  for (const pub of paths) {
    const local = localFileForPublicPath(pub);
    if (!fs.existsSync(local)) {
      console.error(`Missing file (skip): ${local}`);
      continue;
    }
    const key = r2KeyForPublicPath(pub);
    const ext = path.extname(local).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const body = fs.readFileSync(local);

    let skipUpload = false;
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      skipUpload = true;
    } catch {
      /* not found */
    }

    if (!skipUpload) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
      console.log(`  put ${key}`);
    } else {
      console.log(`  exists ${key} (skip upload)`);
    }

    pathToUrl.set(pub, `${publicBase}/${key}`);
  }

  function mapUrl(u) {
    return pathToUrl.get(u) || u;
  }

  let updated = 0;
  for (const p of products) {
    const hasAll =
      pathToUrl.has(p.srcUrl) &&
      (p.gallery || []).every((g) => !g.startsWith("/images/") || pathToUrl.has(g));
    if (!hasAll) {
      console.warn(`Skipping DB row for product ${p.id} (missing some uploads).`);
      continue;
    }
    const srcUrl = mapUrl(p.srcUrl);
    const gallery = (p.gallery || []).map(mapUrl);
    const row = { ...p, srcUrl, gallery, published: true };
    await prisma.product.upsert({
      where: { id: p.id },
      create: row,
      update: { srcUrl, gallery },
    });
    updated += 1;
    console.log(`  DB product ${p.id} → R2 URLs`);
  }

  console.log(`Done. Upserted/updated ${updated} products with R2 image URLs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
