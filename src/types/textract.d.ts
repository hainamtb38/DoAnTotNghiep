declare module "textract" {
  export function fromBufferWithMime(
    mimeType: string,
    buffer: Buffer,
    callback: (error: Error | null, text: string | null) => void
  ): void;
}