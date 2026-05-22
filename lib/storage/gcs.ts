import { Storage } from "@google-cloud/storage";

function getBucketName(): string {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not configured");
  return bucketName;
}

function getStorage(): Storage {
  return new Storage();
}

function formatDateToId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function idToFilename(id: string): string {
  return `${id}.html`;
}

export interface DigestMetadata {
  id: string;
  date: Date;
  url: string;
}

export async function uploadDigest(
  content: string,
  date: Date = new Date()
): Promise<string> {
  const storage = getStorage();
  const bucketName = getBucketName();
  const id = formatDateToId(date);
  const filename = idToFilename(id);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  await file.save(content, {
    contentType: "text/html",
    metadata: {
      cacheControl: "public, max-age=3600",
    },
  });

  return id;
}

export async function getDigest(id: string): Promise<string> {
  const storage = getStorage();
  const bucketName = getBucketName();
  const filename = idToFilename(id);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Digest not found: ${id}`);
  }

  const [content] = await file.download();
  return content.toString("utf-8");
}

export async function generateShareableUrl(id: string): Promise<string> {
  const storage = getStorage();
  const bucketName = getBucketName();
  const filename = idToFilename(id);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Digest not found: ${id}`);
  }

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return url;
}

export async function listDigests(): Promise<DigestMetadata[]> {
  const storage = getStorage();
  const bucketName = getBucketName();

  const bucket = storage.bucket(bucketName);
  const [files] = await bucket.getFiles();

  const digests: DigestMetadata[] = [];

  for (const file of files) {
    const match = file.name.match(/^(\d{8})\.html$/);
    if (match) {
      const id = match[1];
      const year = parseInt(id.substring(0, 4));
      const month = parseInt(id.substring(4, 6)) - 1;
      const day = parseInt(id.substring(6, 8));
      const date = new Date(year, month, day);

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      digests.push({ id, date, url });
    }
  }

  digests.sort((a, b) => b.date.getTime() - a.date.getTime());

  return digests;
}
