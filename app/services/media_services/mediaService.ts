import { Upload, UploadOptions } from "tus-js-client";
import TusFileReader from "./TusFileReader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { AppState, AppStateStatus } from "react-native";

// Constants
const UPLOAD_STORAGE_KEY = "tus_uploads";
const BACKGROUND_UPLOAD_TASK = "background-upload-task";

// Types
interface SelectedFile {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
  id?: string; // Unique identifier for tracking
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  status: "pending" | "uploading" | "completed" | "failed" | "paused";
  error?: Error;
  uploadUrl?: string;
}

interface BatchUploadProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  overallProgress: number;
  files: Map<string, UploadProgress>;
}

interface StoredUpload {
  fileId: string;
  fileName: string;
  fileUri: string;
  uploadUrl: string;
  bytesUploaded: number;
  bytesTotal: number;
  fingerprint: string;
  metadata: { [key: string]: string };
  timestamp: number;
}

// Callback types
type BatchProgressCallback = (progress: BatchUploadProgress) => void;
type FileProgressCallback = (fileId: string, progress: UploadProgress) => void;
type BatchCompleteCallback = (results: UploadResult[]) => void;
type BatchErrorCallback = (error: Error, failedUploads: UploadResult[]) => void;

export interface UploadResult {
  fileId: string;
  fileName: string;
  success: boolean;
  uploadUrl?: string;
  error?: Error;
}

interface MultipleUploadConfig {
  endpoint: string;
  chunkSize?: number;
  maxConcurrent?: number; // Max parallel uploads
  metadata?: { [key: string]: string };
  headers?: { [key: string]: string };
  retryAttempts?: number;
  strategy?: "parallel" | "sequential";
  resumable?: boolean;
  backgroundUpload?: boolean;
  onBatchProgress?: BatchProgressCallback;
  onFileProgress?: FileProgressCallback;
  onBatchComplete?: BatchCompleteCallback;
  onBatchError?: BatchErrorCallback;
}

interface ActiveUpload {
  upload: Upload;
  file: SelectedFile;
  resolve: (result: UploadResult) => void;
  reject: (error: Error) => void;
  config: MultipleUploadConfig;
}

export class MultipleFilesUploadService {
  private fileReader: TusFileReader;
  private activeUploads: Map<string, ActiveUpload> = new Map();
  private batchProgress: BatchUploadProgress;
  private config: MultipleUploadConfig = {} as MultipleUploadConfig;
  private isBackgroundMode: boolean = false;
  private appState: AppStateStatus = AppState.currentState;

  constructor() {
    this.fileReader = new TusFileReader();
    this.batchProgress = {
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      files: new Map(),
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );
    // Store subscription for cleanup (React Native 0.65+)
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "background") {
      this.isBackgroundMode = true;
      this.pauseActiveUploads();
    } else if (nextAppState === "active") {
      this.isBackgroundMode = false;
      this.resumeActiveUploads();
    }
  };

  async initializeBackgroundUploads(): Promise<void> {
    // Basic implementation using app state changes
    // In a production app, you might want to use expo-background-fetch
    // or similar background processing capabilities
  }

  private async ensureLocalFileUri(
    uri: string,
    name?: string
  ): Promise<{ uri: string; size: number }> {
    if (uri.startsWith("file://")) {
      try {
        const stats = await FileSystem.getInfoAsync(uri);
        if (!stats.exists) {
          throw new Error(`File not found at: ${uri}`);
        }
        return { uri, size: (stats as any).size ?? 0 };
      } catch (error) {
        throw new Error(`Failed to access file: ${error}`);
      }
    }

    // Convert content:// URI to file:// URI
    const target = `${FileSystem.documentDirectory}temp_${name || "file"}`;

    try {
      await FileSystem.copyAsync({
        from: uri,
        to: target,
      });
      const stats = await FileSystem.getInfoAsync(target);
      return { uri: target, size: (stats as any).size ?? 0 };
    } catch (copyError) {
      // Fallback: try reading and writing as base64
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(target, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const stats = await FileSystem.getInfoAsync(target);
        return { uri: target, size: (stats as any).size ?? 0 };
      } catch (base64Error) {
        throw new Error(`Failed to convert URI to local file: ${base64Error}`);
      }
    }
  }

  private generateFingerprint(
    file: SelectedFile,
    config: MultipleUploadConfig
  ): string {
    const cleanName = (file.name || "unknown").replace(/[^a-zA-Z0-9]/g, "");
    const cleanEndpoint = config.endpoint.replace(/[^a-zA-Z0-9]/g, "");
    const propId = config.metadata?.propId || "";
    const userId = config.metadata?.userId || "";

    return `tus-${cleanName}-${file.size}-${cleanEndpoint}-propId${propId}userId${userId}`;
  }

  private async storeUploadInfo(
    fileId: string,
    file: SelectedFile,
    upload: Upload,
    config: MultipleUploadConfig
  ): Promise<void> {
    try {
      const fingerprint = this.generateFingerprint(file, config);
      const uploadInfo: StoredUpload = {
        fileId,
        fileName: file.name || "unknown",
        fileUri: file.uri,
        uploadUrl: upload.url || "",
        bytesUploaded: 0,
        bytesTotal: file.size || 0,
        fingerprint,
        metadata: config.metadata || {},
        timestamp: Date.now(),
      };

      const existingUploads = await this.getStoredUploads();
      existingUploads[fileId] = uploadInfo;

      await AsyncStorage.setItem(
        UPLOAD_STORAGE_KEY,
        JSON.stringify(existingUploads)
      );
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  private async getStoredUploads(): Promise<{
    [fileId: string]: StoredUpload;
  }> {
    try {
      const stored = await AsyncStorage.getItem(UPLOAD_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  private async removeStoredUpload(fileId: string): Promise<void> {
    try {
      const uploads = await this.getStoredUploads();
      delete uploads[fileId];
      await AsyncStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(uploads));
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  private generateRetryDelays(maxAttempts: number): number[] {
    const delays: number[] = [];
    for (let i = 0; i < maxAttempts; i++) {
      delays.push(Math.min(1000 * Math.pow(2, i), 30000)); // Exponential backoff, max 30s
    }
    return delays;
  }

  async resumePendingUploads(): Promise<void> {
    try {
      const storedUploads = await this.getStoredUploads();
      for (const storedUpload of Object.values(storedUploads)) {
        if (storedUpload.uploadUrl) {
          // Resume upload logic here
        }
      }
    } catch (error) {
      // Silent fail for resume operations
    }
  }

  async startBatchUpload(
    files: SelectedFile[],
    config: MultipleUploadConfig
  ): Promise<UploadResult[]> {
    this.config = config;

    this.batchProgress = {
      totalFiles: files.length,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      files: new Map(),
    };

    try {
      if (config.backgroundUpload) {
        await this.initializeBackgroundUploads();
      }

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

      config.onBatchComplete?.(results);
      return results;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const failedResults: UploadResult[] = files.map((file) => ({
        fileId: file.id || "unknown",
        fileName: file.name || "unknown",
        success: false,
        error: errorObj,
      }));

      config.onBatchError?.(errorObj, failedResults);
      throw errorObj;
    }
  }

  private async uploadSingleFile(
    file: SelectedFile,
    config: MultipleUploadConfig
  ): Promise<UploadResult> {
    const fileId =
      file.id || `${config.metadata?.propId || "temp"}-${file.name}`;

    return new Promise<UploadResult>(async (resolve, reject) => {
      try {
        const { uri: fileUri, size: actualSize } =
          await this.ensureLocalFileUri(file.uri, file.name);

        // Update file progress
        const initialProgress: UploadProgress = {
          fileId,
          fileName: file.name || "unknown",
          bytesUploaded: 0,
          bytesTotal: actualSize,
          percentage: 0,
          status: "uploading",
        };

        this.batchProgress.files.set(fileId, initialProgress);
        config.onFileProgress?.(fileId, initialProgress);

        // Create file object for TUS
        const tusFile = {
          uri: fileUri,
          name: file.name || "unknown",
          type: file.type || "application/octet-stream",
          size: actualSize,
        };

        // Generate fingerprint for resumability
        const fingerprint = this.generateFingerprint(file, this.config);

        const uploadOptions: UploadOptions = {
          endpoint: this.config.endpoint,
          uploadSize: actualSize, // Explicitly set the upload size
          chunkSize: this.config.chunkSize || 1024 * 1024,
          retryDelays: this.generateRetryDelays(this.config.retryAttempts || 3),
          storeFingerprintForResuming: this.config.resumable !== false,
          removeFingerprintOnSuccess: true,
          fingerprint: () => Promise.resolve(fingerprint),
          metadata: {
            filename: file.name || "unknown",
            filetype: file.type || "application/octet-stream",
            fileId: fileId,
            ...this.config.metadata,
          },
          headers: this.config.headers || {},
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percentage = (bytesUploaded / bytesTotal) * 100;
            const progress: UploadProgress = {
              fileId,
              fileName: file.name || "unknown",
              bytesUploaded,
              bytesTotal,
              percentage,
              status: "uploading",
            };

            this.batchProgress.files.set(fileId, progress);
            this.updateBatchProgress();
            config.onFileProgress?.(fileId, progress);
          },
          onSuccess: () => {
            const progress: UploadProgress = {
              fileId,
              fileName: file.name || "unknown",
              bytesUploaded: actualSize,
              bytesTotal: actualSize,
              percentage: 100,
              status: "completed",
              uploadUrl: upload.url || undefined,
            };

            this.batchProgress.files.set(fileId, progress);
            this.batchProgress.completedFiles++;
            this.updateBatchProgress();

            config.onFileProgress?.(fileId, progress);
            this.activeUploads.delete(fileId);
            this.removeStoredUpload(fileId);

            resolve({
              fileId,
              fileName: file.name || "unknown",
              success: true,
              uploadUrl: upload.url || undefined,
            });
          },
          onError: (error: any) => {
            // tus-js-client attaches originalRequest/response for debugging in many cases
            console.log("tus error:", error?.message || error);
            try {
              console.log("originalRequest:", {
                method: error?.originalRequest?.method,
                url: error?.originalRequest?.url,
                headers: error?.originalRequest?.headers,
              });
              console.log("originalResponse:", {
                status: error?.originalResponse?.getStatus
                  ? error.originalResponse.getStatus()
                  : undefined,
                headers: error?.originalResponse?.getHeader
                  ? {
                      "upload-offset":
                        error.originalResponse.getHeader("upload-offset"),
                      "upload-length":
                        error.originalResponse.getHeader("upload-length"),
                      location: error.originalResponse.getHeader("location"),
                    }
                  : undefined,
              });
            } catch {}
            // your existing progress/resolve handling...
          },
          onChunkComplete: (
            chunkSize: number,
            bytesAccepted: number,
            bytesTotal: number
          ) => {
            // Optional: Handle chunk completion
          },
        };

        // Create TUS upload instance
        const upload = new Upload(tusFile as any, uploadOptions);

        // Store active upload
        this.activeUploads.set(fileId, {
          upload,
          file,
          resolve,
          reject,
          config,
        });

        // Check for previous uploads and resume if possible
        // Note: TUS resumption is handled automatically by the library using fingerprints

        // Start the upload
        upload.start();

        // Store upload info for resumability
        await this.storeUploadInfo(fileId, file, upload, config);
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        this.activeUploads.delete(fileId);
        resolve({
          fileId,
          fileName: file.name || "unknown",
          success: false,
          error: errorObj,
        });
      }
    });
  }

  private updateBatchProgress(): void {
    const totalFiles = this.batchProgress.totalFiles;
    const completedFiles = this.batchProgress.completedFiles;
    const failedFiles = this.batchProgress.failedFiles;

    this.batchProgress.overallProgress =
      totalFiles > 0 ? ((completedFiles + failedFiles) / totalFiles) * 100 : 0;

    this.config.onBatchProgress?.(this.batchProgress);
  }

  pauseActiveUploads(): void {
    for (const [fileId, activeUpload] of this.activeUploads) {
      try {
        activeUpload.upload.abort();

        const progress = this.batchProgress.files.get(fileId);
        if (progress) {
          progress.status = "paused";
          this.batchProgress.files.set(fileId, progress);
          this.config.onFileProgress?.(fileId, progress);
        }
      } catch (error) {
        // Silent fail for pause operations
      }
    }
  }

  resumeActiveUploads(): void {
    for (const [fileId, activeUpload] of this.activeUploads) {
      try {
        const progress = this.batchProgress.files.get(fileId);
        if (progress?.status === "paused") {
          activeUpload.upload.start();
          progress.status = "uploading";
          this.batchProgress.files.set(fileId, progress);
          this.config.onFileProgress?.(fileId, progress);
        }
      } catch (error) {
        // Silent fail for resume operations
      }
    }
  }

  cancelUpload(fileId: string): void {
    const activeUpload = this.activeUploads.get(fileId);
    if (activeUpload) {
      activeUpload.upload.abort();
      this.activeUploads.delete(fileId);
      this.removeStoredUpload(fileId);

      const progress = this.batchProgress.files.get(fileId);
      if (progress) {
        progress.status = "failed";
        this.batchProgress.files.set(fileId, progress);
        this.config.onFileProgress?.(fileId, progress);
      }
    }
  }

  cancelAllUploads(): void {
    for (const fileId of this.activeUploads.keys()) {
      this.cancelUpload(fileId);
    }
  }

  getUploadProgress(fileId: string): UploadProgress | undefined {
    return this.batchProgress.files.get(fileId);
  }

  getBatchProgress(): BatchUploadProgress {
    return { ...this.batchProgress };
  }

  cleanup(): void {
    this.cancelAllUploads();
    this.activeUploads.clear();
    this.batchProgress.files.clear();
  }
}

// Single file upload service for backward compatibility
export class TusUploadService {
  private fileReader: TusFileReader;
  private uploadService: MultipleFilesUploadService;

  constructor() {
    this.fileReader = new TusFileReader();
    this.uploadService = new MultipleFilesUploadService();
  }

  async startUpload(
    file: SelectedFile,
    config: Omit<MultipleUploadConfig, "strategy">
  ): Promise<Upload> {
    const results = await this.uploadService.startBatchUpload([file], {
      ...config,
      strategy: "sequential",
    });

    if (results[0]?.success) {
      // Return a mock Upload object for compatibility
      return {} as Upload;
    } else {
      throw results[0]?.error || new Error("Upload failed");
    }
  }

  pauseUpload(upload: Upload): void {
    // Not implemented for single file service
  }

  resumeUpload(upload: Upload): void {
    // Not implemented for single file service
  }
}

// Usage example and utility functions
export const uploadMultipleFiles = async (
  files: SelectedFile[],
  config: MultipleUploadConfig
): Promise<UploadResult[]> => {
  const uploadService = new MultipleFilesUploadService();

  try {
    const results = await uploadService.startBatchUpload(files, {
      ...config,
      onBatchProgress: (progress) => {
        // Handle batch progress
      },
      onFileProgress: (fileId, progress) => {
        // Handle individual file progress
      },
      onBatchComplete: (results) => {
        // Handle batch completion
      },
      onBatchError: (error, failedUploads) => {
        // Handle batch error
      },
    });

    return results;
  } catch (error) {
    throw error;
  } finally {
    uploadService.cleanup();
  }
};

export default MultipleFilesUploadService;
