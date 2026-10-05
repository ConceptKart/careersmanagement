import { LocalDiskStorage } from "./local-disk";
import type { StorageDriver } from "./types";

let driver: StorageDriver | null = null;

/**
 * Returns the active storage driver.
 * Future: `STORAGE_DRIVER=s3` → S3Storage without changing repositories/services.
 */
export function getStorage(): StorageDriver {
  if (!driver) {
    driver = new LocalDiskStorage();
  }
  return driver;
}

export type { StorageDriver, StorageObject, PutObjectInput } from "./types";
