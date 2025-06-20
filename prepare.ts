import { $ } from "bun";

await Promise.all([
  $`git config --local core.hooksPath .githooks`.quiet(),
  $`git update-index --skip-worktree frontend/shopify.app.bk-reviews-dev.toml`.quiet(),
]);
