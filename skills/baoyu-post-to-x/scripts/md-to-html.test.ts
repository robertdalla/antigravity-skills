import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseMarkdown } from "./md-to-html.ts";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

test("parseMarkdown resolves encoded spaces and literal percent image paths", async (t) => {
  const root = await makeTempDir("baoyu-post-to-x-images-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const articlePath = path.join(root, "article.md");
  const tempDir = path.join(root, "tmp");
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(path.join(root, "Pasted image.png"), "png");
  await fs.writeFile(path.join(root, "100%.png"), "png");
  await fs.writeFile(
    articlePath,
    [
      "# Title",
      "",
      "![encoded](Pasted%20image.png)",
      "",
      "![literal](100%.png)",
    ].join("\n"),
  );

  const result = await parseMarkdown(articlePath, { tempDir });

  assert.equal(result.contentImages[0]?.localPath, path.join(root, "Pasted image.png"));
  assert.equal(result.contentImages[1]?.localPath, path.join(root, "100%.png"));
});
