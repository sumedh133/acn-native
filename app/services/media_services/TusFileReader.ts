// TusFileReader.ts
import RNFS from "react-native-fs";
import base64 from "base64-js";
import * as FileSystem from "expo-file-system";

// Normalize a URI into an RNFS-friendly absolute path
function toRNFSPath(uri: string) {
  if (!uri) throw new Error("Empty URI");
  // If it’s a file:// URI, strip the scheme
  if (uri.startsWith("file://")) {
    return uri.replace("file://", "");
  }
  // If it’s already an absolute path, return as-is
  if (uri.startsWith("/")) return uri;
  // Otherwise, caller should have converted content:// → file:// first
  return uri;
}

// Convert content:// to a local file we control (Expo FS), return RNFS path
async function ensureFilePath(uri: string, name = "upload.bin"): Promise<string> {
  if (uri.startsWith("content://")) {
    const target = `${FileSystem.documentDirectory}${Date.now()}_${name}`;
    await FileSystem.copyAsync({ from: uri, to: target });
    return toRNFSPath(target); // strip scheme for RNFS
  }
  // file:// or absolute path
  return toRNFSPath(uri);
}

interface FileInput {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

export default class TusFileReader {
  async openFile(input: FileInput) {
    try {
      const path = await ensureFilePath(input.uri, input.name);

      const stats = await RNFS.stat(path);
      const size = Number(stats.size ?? 0);

      const fileSource = {
        size,
        // IMPORTANT: return Uint8Array, not { value, done }
        slice: async (start: number, end: number): Promise<Uint8Array> => {
          const clampedEnd = Math.min(end, size);
          const length = clampedEnd - start;
          if (length <= 0) return new Uint8Array(0);

          // RNFS.read(path, length, position, encoding)
          const base64Chunk = await RNFS.read(path, length, start, "base64");
          if (!base64Chunk || base64Chunk.length === 0) {
            // returning empty makes tus stop; throw to surface the problem
            throw new Error(`RNFS returned empty chunk at [${start}, ${clampedEnd})`);
          }
          return base64.toByteArray(base64Chunk);
        },
        close: () => {
          // nothing to clean up
        },
      };

      return fileSource;
    } catch (err) {
      throw new Error(`Failed to open file: ${String(err)}`);
    }
  }
}
