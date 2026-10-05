export type StorageObject = {
  /** Relative key stored in DB, e.g. `resumes/{jobId}/{uuid}.pdf` */
  key: string;
  /** Absolute or resolved filesystem / remote identifier */
  location: string;
  contentType: string;
  size: number;
};

export type PutObjectInput = {
  /** Path under the storage root (no leading slash) */
  key: string;
  data: Buffer | Uint8Array;
  contentType: string;
};

/**
 * Storage driver abstraction.
 * Local disk now; swap implementation for S3/compatible later without changing callers.
 */
export interface StorageDriver {
  put(input: PutObjectInput): Promise<StorageObject>;
  getStream(key: string): Promise<{ stream: ReadableStream | NodeJS.ReadableStream; contentType: string; size: number }>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  /** Resolve a key to an absolute local path when supported; undefined for remote-only drivers */
  resolveLocalPath?(key: string): string | undefined;
}
