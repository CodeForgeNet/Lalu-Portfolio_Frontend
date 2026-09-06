/** Incremental SSE parser shared by provider and browser streams. */
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const extract = (frame: string) => frame.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).replace(/^ /, "")).join("\n");
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const data = extract(frame);
        if (data) yield data;
      }
      if (done) {
        if (buffer.trim()) throw new Error("The stream ended in an incomplete event.");
        return;
      }
      if (buffer.length > 1_000_000) throw new Error("Stream event exceeded the size limit.");
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
