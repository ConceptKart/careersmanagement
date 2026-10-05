import { accessSync, createReadStream, promises as fs } from "fs";
import path from "path";
import { getEnv } from "@/lib/config/env";
import type { PutObjectInput, StorageDriver, StorageObject } from "./types";

function assertSafeKey(key: string): string {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("Invalid storage key");
  }
  return normalized;
}

/** True when `candidate` is the root or a path inside it (Windows-safe). */
function isPathInsideRoot(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function uniqueResolvedRoots(primary: string): string[] {
  const candidates = [primary, path.resolve("./uploads"), path.resolve("../uploads")];
  const seen = new Set<string>();
  const roots: string[] = [];
  for (const candidate of candidates) {
    const normalized = path.resolve(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    roots.push(normalized);
  }
  return roots;
}

export class LocalDiskStorage implements StorageDriver {
  private readonly root: string;
  private readonly readRoots: string[];

  constructor(root = path.resolve(getEnv().UPLOAD_ROOT)) {
    this.root = root;
    // Reads also check sibling upload dirs so PHP-era files and web-local
    // uploads both resolve during migration.
    this.readRoots = uniqueResolvedRoots(root);
  }

  private pathUnderRoot(root: string, key: string): string {
    const safe = assertSafeKey(key);
    const resolved = path.resolve(root, safe);
    if (!isPathInsideRoot(root, resolved)) {
      throw new Error("Path traversal rejected");
    }
    return resolved;
  }

  private fullPath(key: string): string {
    return this.pathUnderRoot(this.root, key);
  }

  /** First existing path across primary + fallback upload roots. */
  private async resolveExistingPath(key: string): Promise<string | null> {
    for (const root of this.readRoots) {
      const full = this.pathUnderRoot(root, key);
      try {
        await fs.access(full);
        return full;
      } catch {
        // try next root
      }
    }
    return null;
  }

  async put(input: PutObjectInput): Promise<StorageObject> {
    const key = assertSafeKey(input.key);
    const full = this.fullPath(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    const buffer = Buffer.isBuffer(input.data) ? input.data : Buffer.from(input.data);
    await fs.writeFile(full, buffer);
    return {
      key,
      location: full,
      contentType: input.contentType,
      size: buffer.byteLength,
    };
  }

  async getStream(key: string) {
    const full = (await this.resolveExistingPath(key)) ?? this.fullPath(key);
    const stat = await fs.stat(full);
    const stream = createReadStream(full);
    return {
      stream,
      contentType: "application/octet-stream",
      size: stat.size,
    };
  }

  async exists(key: string): Promise<boolean> {
    return (await this.resolveExistingPath(key)) !== null;
  }

  async delete(key: string): Promise<void> {
    const full = (await this.resolveExistingPath(key)) ?? this.fullPath(key);
    await fs.unlink(full);
  }

  resolveLocalPath(key: string): string {
    for (const root of this.readRoots) {
      const full = this.pathUnderRoot(root, key);
      try {
        accessSync(full);
        return full;
      } catch {
        // try next
      }
    }
    return this.fullPath(key);
  }
}
