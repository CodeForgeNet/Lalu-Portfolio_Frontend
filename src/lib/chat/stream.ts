/** Read named SSE events across byte boundaries; reject incomplete frames. */
export async function* readChatEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{ event: string; data: Record<string, unknown> }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const lines = frame.split(/\r?\n/);
        const event =
          lines
            .find((line) => line.startsWith("event:"))
            ?.slice(6)
            .trim() || "message";
        const raw = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""))
          .join("\n");
        if (!raw) continue;
        const data: unknown = JSON.parse(raw);
        if (!data || typeof data !== "object" || Array.isArray(data))
          throw new Error("Invalid stream event");
        yield { event, data: data as Record<string, unknown> };
      }
      if (done) {
        if (buffer.trim()) throw new Error("Incomplete stream event");
        return;
      }
      if (buffer.length > 1_000_000)
        throw new Error("Stream event exceeded size limit");
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
