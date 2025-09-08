import {
  MultipleFilesUploadService,
  SelectedFile,
  MultipleUploadConfig,
  UploadResult,
} from "./mediaService";
import { MediaObj } from "@/app/types/MediaTypes";

const TUS_ENDPOINT =
  "https://tus-protocol-dot-iqol-crm.uc.r.appspot.com/files/";

export interface MediaUploadQueueConfig {
  propId: string;
  userId: string;
  onProgress?: (progress: number) => void;
  onFileProgress?: (fileId: string, progress: any) => void;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: Error) => void;
}

export class MediaUploadQueue {
  private uploadService: MultipleFilesUploadService;
  private config: MediaUploadQueueConfig;

  constructor(config: MediaUploadQueueConfig) {
    this.config = config;
    this.uploadService = new MultipleFilesUploadService();
  }

  /**
   * Convert MediaObj[] to SelectedFile[] for TUS upload
   */
  private convertMediaToSelectedFiles(
    media: MediaObj[],
    type: "photo" | "video" | "document"
  ): SelectedFile[] {
    return media.map((item, index) => ({
      uri: item.uri,
      name: item.name || `${type}_${Date.now()}_${index}`,
      type: item.type || this.getMimeType(type),
      size: item.size || 0,
      id: `${this.config.propId}-${type}-${item.name || Date.now()}-${index}`,
    }));
  }

  /**
   * Get MIME type based on media type
   */
  private getMimeType(type: "photo" | "video" | "document"): string {
    switch (type) {
      case "photo":
        return "image/jpeg";
      case "video":
        return "video/mp4";
      case "document":
        return "application/pdf";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Upload all media files via TUS
   */
  async uploadMedia(
    photos: MediaObj[],
    videos: MediaObj[],
    documents: MediaObj[]
  ): Promise<UploadResult[]> {
    try {
      // Convert all media to selected files
      const allFiles: SelectedFile[] = [
        ...this.convertMediaToSelectedFiles(photos, "photo"),
        ...this.convertMediaToSelectedFiles(videos, "video"),
        ...this.convertMediaToSelectedFiles(documents, "document"),
      ];

      if (allFiles.length === 0) {
        return [];
      }

      // Configure TUS upload
      const uploadConfig: MultipleUploadConfig = {
        endpoint: `${TUS_ENDPOINT}${this.config.propId}`,
        chunkSize: 1024 * 1024, // 1MB chunks
        maxConcurrent: 3,
        strategy: "parallel",
        resumable: true,
        retryAttempts: 2,
        metadata: {
          propId: this.config.propId,
          userId: this.config.userId,
        },
        onBatchProgress: (progress) => {
          this.config.onProgress?.(progress.overallProgress);
        },
        onFileProgress: (fileId, progress) => {
          this.config.onFileProgress?.(fileId, progress);
        },
        onBatchComplete: (results) => {
          this.config.onComplete?.(results);
        },
        onBatchError: (error) => {
          this.config.onError?.(error);
        },
      };

      // Start batch upload
      const results = await this.uploadService.startBatchUpload(
        allFiles,
        uploadConfig
      );

      return results;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.config.onError?.(errorObj);
      throw errorObj;
    }
  }

  /**
   * Get upload progress for a specific file
   * Note: Progress is handled through the onFileProgress callback
   */
  // getFileProgress(fileId: string): any {
  //   return this.uploadService.getFileProgress(fileId);
  // }

  /**
   * Cancel all uploads
   */
  cancelAllUploads(): void {
    this.uploadService.cancelAllUploads();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.uploadService.cleanup();
  }
}

export default MediaUploadQueue;
