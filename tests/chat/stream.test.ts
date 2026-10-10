import test from "node:test";
import assert from "node:assert/strict";
import { readChatEvents } from "../../src/lib/chat/stream.ts";
function stream(text: string) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
}
test("named chat events preserve fragmented Unicode, CRLF, comments and multiline JSON", async () => {
  const results = [];
  for await (const event of readChatEvents(
    stream(
      ': heartbeat\r\n\r\nevent: chunk\r\ndata: {"text":\r\ndata: "hello → 世界"}\r\n\r\nevent: done\r\ndata: {}\r\n\r\n',
    ),
  ))
    results.push(event);
  assert.deepEqual(results, [
    { event: "chunk", data: { text: "hello → 世界" } },
    { event: "done", data: {} },
  ]);
});
test("truncated frames fail instead of silently appearing complete", async () => {
  await assert.rejects(async () => {
    for await (const event of readChatEvents(
      stream('event: chunk\ndata: {"text":"unfinished"}'),
    ))
      void event;
  }, /Incomplete stream/);
});
test("non-object event payloads are rejected", async () => {
  await assert.rejects(async () => {
    for await (const event of readChatEvents(
      stream("event: done\ndata: null\n\n"),
    ))
      void event;
  }, /Invalid stream event/);
});
