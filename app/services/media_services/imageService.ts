// @/app/services/MultipleFilesUploadService.ts

import { Upload, UploadOptions } from "tus-js-client";

// All interfaces defined in this file
export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  id: string;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  success: boolean;
  uploadUrl?: string;
  error?: Error;
}

export interface MultipleUploadConfig {
  endpoint: string;
  chunkSize?: number;
  maxConcurrent?: number;
  metadata?: Record<string, string>;
  headers?: Record<string, string>;
  retryAttempts?: number;
  strategy?: "parallel" | "sequential";
  resumable?: boolean;
  onBatchProgress?: (progress: {
    overallProgress: number; // 0-100
    perFile: Record<string, number>; // fileId -> 0-100
  }) => void;
  onFileProgress?: (
    fileId: string,
    progress: { uploaded: number; total: number; pct: number }
  ) => void;
  onBatchComplete?: (results: UploadResult[]) => void;
  onBatchError?: (error: Error) => void;
}

export interface MediaUploadData {
  photos: string[];
  videos: string[];
  documents: string[];
}

export interface FilePickerResult {
  uri: string;
  name: string;
  type: string;
  size: number;
}

// Constants for file categorization
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
] as const;

export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
  "video/flv",
  "video/webm",
  "video/mkv",
  "video/3gp",
] as const;

export class MultipleFilesUploadService {
  private uploads: Map<string, Upload> = new Map();
  private fileProgress: Map<string, number> = new Map();
  private currentBatchTotal: number = 0;

  constructor() {
    this.uploads = new Map();
  }

  async startBatchUpload(
    files: SelectedFile[],
    config: MultipleUploadConfig
  ): Promise<UploadResult[]> {
    try {
      this.currentBatchTotal = files.length;
      this.fileProgress.clear();
      const uploadPromises = files.map((file) =>
        this.uploadSingleFile(file, config)
      );

      let results: UploadResult[];

      if (config.strategy === "sequential") {
        results = [];
        for (const promise of uploadPromises) {
          try {
            const result = await promise;
            results.push(result);
          } catch (error) {
            results.push({
              fileId: "unknown",
              fileName: "unknown",
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }
      } else {
        // Parallel with concurrency limit
        const maxConcurrent = config.maxConcurrent || 3;
        results = [];

        for (let i = 0; i < uploadPromises.length; i += maxConcurrent) {
          const batch = uploadPromises.slice(i, i + maxConcurrent);
          const batchResults = await Promise.allSettled(batch);

          for (const result of batchResults) {
            if (result.status === "fulfilled") {
              results.push(result.value);
            } else {
              results.push({
                fileId: "unknown",
                fileName: "unknown",
                success: false,
                error:
                  result.reason instanceof Error
                    ? result.reason
                    : new Error(String(result.reason)),
              });
            }
          }
        }
      }

      // Notify batch complete
      config.onBatchComplete?.(results);
      return results;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const failedResults: UploadResult[] = files.map((file) => ({
        fileId: file.id,
        fileName: file.name,
        success: false,
        error: errorObj,
      }));
      config.onBatchError?.(errorObj);
      throw errorObj;
    }
  }

  private async uploadSingleFile(
    file: SelectedFile,
    config: MultipleUploadConfig
  ): Promise<UploadResult> {
    return new Promise<UploadResult>((resolve) => {
      try {
        const uploadOptions: UploadOptions = {
          endpoint: config.endpoint,
          chunkSize: config.chunkSize || 2 * 1024 * 1024,
          retryDelays: this.generateRetryDelays(config.retryAttempts || 3),
          metadata: {
            ...config.metadata,
            filename: file.name,
            filetype: file.type,
            filesize: file.size.toString(),
          },
          headers: config.headers || {},
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const pct =
              bytesTotal > 0
                ? Math.round((bytesUploaded / bytesTotal) * 100)
                : 0;
            this.fileProgress.set(file.id, pct);
            config.onFileProgress?.(file.id, {
              uploaded: bytesUploaded,
              total: bytesTotal,
              pct,
            });
            if (this.currentBatchTotal > 0 && config.onBatchProgress) {
              // Compute simple average progress across files in the batch
              let sum = 0;
              this.fileProgress.forEach((v) => (sum += v));
              const overall = Math.round(sum / this.currentBatchTotal);
              const perFile: Record<string, number> = {};
              this.fileProgress.forEach((v, k) => (perFile[k] = v));
              config.onBatchProgress({ overallProgress: overall, perFile });
            }
          },
          onError: (error: Error) => {
            resolve({
              fileId: file.id,
              fileName: file.name,
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          },
          onSuccess: () => {
            // Fix type error: handle potential null/undefined url
            const uploadUrl = upload.url;
            resolve({
              fileId: file.id,
              fileName: file.name,
              success: true,
              uploadUrl: uploadUrl || undefined, // Convert null to undefined
            });
          },
        };

        // Create upload instance
        const upload = new Upload(this.createFileFromUri(file), uploadOptions);
        this.uploads.set(file.id, upload);

        // Start upload
        upload.start();
      } catch (error) {
        resolve({
          fileId: file.id,
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });
  }

  private createFileFromUri(file: SelectedFile): File {
    // For React Native environments, you'll need to handle file creation differently
    // This is a placeholder implementation - in real React Native apps you might use:
    // - react-native-fs to read file contents
    // - FormData with proper file handling
    // - Platform-specific file handling

    try {
      // Create a blob with proper type
      const blob = new Blob([], { type: file.type });
      return new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
    } catch (error) {
      // Fallback for environments where File constructor isn't available
      console.warn("File constructor not available, using fallback");
      const blob = new Blob([], { type: file.type });
      // Cast to File as a fallback - you may need platform-specific handling here
      return blob as unknown as File;
    }
  }

  private generateRetryDelays(attempts: number): number[] {
    return Array.from({ length: attempts }, (_, i) =>
      Math.min(1000 * Math.pow(2, i), 10000)
    );
  }

  public cancelUpload(fileId: string): boolean {
    const upload = this.uploads.get(fileId);
    if (upload) {
      try {
        upload.abort();
        this.uploads.delete(fileId);
        return true;
      } catch (error) {
        console.error("Failed to cancel upload:", error);
        return false;
      }
    }
    return false;
  }

  public cancelAllUploads(): void {
    this.uploads.forEach((upload, fileId) => {
      try {
        upload.abort();
      } catch (error) {
        console.error(`Failed to cancel upload for ${fileId}:`, error);
      }
    });
    this.uploads.clear();
  }

  public getUploadStatus(fileId: string): string | undefined {
    const upload = this.uploads.get(fileId);
    return upload?.url || undefined; // Convert null to undefined for consistency
  }

  public getActiveUploadsCount(): number {
    return this.uploads.size;
  }

  public isUploading(fileId: string): boolean {
    return this.uploads.has(fileId);
  }

  // Utility method to categorize files by MIME type
  public static categorizeFilesByType(files: FilePickerResult[]): {
    photos: FilePickerResult[];
    videos: FilePickerResult[];
    documents: FilePickerResult[];
  } {
    const categorized = {
      photos: [] as FilePickerResult[],
      videos: [] as FilePickerResult[],
      documents: [] as FilePickerResult[],
    };

    files.forEach((file) => {
      const mimeType = file.type.toLowerCase();

      if (mimeType.startsWith("image/")) {
        categorized.photos.push(file);
      } else if (mimeType.startsWith("video/")) {
        categorized.videos.push(file);
      } else {
        categorized.documents.push(file);
      }
    });

    return categorized;
  }

  // Validate file size and type
  public static validateFile(file: FilePickerResult): {
    valid: boolean;
    error?: string;
  } {
    // Max file size: 100MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is 100MB.`,
      };
    }

    // Check for empty files
    if (file.size === 0) {
      return {
        valid: false,
        error: `File "${file.name}" is empty.`,
      };
    }

    return { valid: true };
  }
}

// Export a singleton instance for easy use
export const uploadService = new MultipleFilesUploadService();
