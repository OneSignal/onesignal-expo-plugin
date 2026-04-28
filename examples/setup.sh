#!/usr/bin/env bash
set -euo pipefail

# Invoked from a demo dir (e.g. examples/demo/) via `bun run setup`.
# ORIGINAL_DIR captures that dir so we can return to it after building
# the plugin; PLUGIN_ROOT is two levels up (the plugin package itself).
ORIGINAL_DIR=$(pwd)
PLUGIN_ROOT="$(cd ../../ && pwd)"
STAMP_FILE="$PLUGIN_ROOT/.expo-plugin-source.stamp"
TGZ_FILE="$PLUGIN_ROOT/onesignal-expo-plugin.tgz"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/onesignal-expo-plugin"

# Content hash of every input that can affect the published tarball.
# We deliberately hash file contents (shasum each file, then shasum the
# combined list) instead of using `find -newer`, because mtimes get
# bumped by routine git operations (checkout, branch switch, rebase)
# even when the source is identical — that caused needless rebuilds.
# Inputs match exactly what `bun pm pack` ships per package.json's "files"
# field: src/ (transpiled to dist/), serviceExtensionFiles/, plus the
# packaging-relevant configs (package.json, tsconfig.json). build.gradle
# is intentionally excluded — it lives at the repo root for spotless
# formatting only and is not part of the tarball.
src_hash=$(find "$PLUGIN_ROOT/src" "$PLUGIN_ROOT/serviceExtensionFiles" \
                "$PLUGIN_ROOT/package.json" "$PLUGIN_ROOT/tsconfig.json" \
           -type f 2>/dev/null \
           | sort \
           | xargs shasum 2>/dev/null \
           | shasum \
           | awk '{print $1}')

# Skip the whole rebuild when:
#   - the demo already has the plugin installed,
#   - the cached tarball is still on disk, and
#   - the source hash matches the last successful build.
# FORCE_SETUP=1 bypasses the cache when something feels off.
if [ "${FORCE_SETUP:-0}" != "1" ] \
   && [ -d "$INSTALLED_DIR" ] \
   && [ -f "$STAMP_FILE" ] \
   && [ -f "$TGZ_FILE" ] \
   && [ "$(cat "$STAMP_FILE")" = "$src_hash" ]; then
  echo "Plugin source unchanged, skipping rebuild. Set FORCE_SETUP=1 to override."
  # Re-apply the glob workaround in case `bun install` ran since the last
  # setup and re-hoisted glob@7. See the note at the bottom of this file.
  rm -rf "$ORIGINAL_DIR/node_modules/glob"
  exit 0
fi

cd "$PLUGIN_ROOT"
bun run build

# `bun pm pack` honors package.json's "files" field (so the tarball matches
# what would actually be published). The version suffix in the filename
# is unstable, so we normalize to onesignal-expo-plugin.tgz for a
# deterministic path that package.json + the install step can reference.
rm -f onesignal-expo-plugin*.tgz
bun pm pack
mv onesignal-expo-plugin-*.tgz onesignal-expo-plugin.tgz

cd "$ORIGINAL_DIR"

# Always go through bun add so bun.lock's integrity hash for the tarball
# stays in sync with the freshly-built tarball on disk. A previous version
# of this script had a "hot path" that just untarred over node_modules
# directly, which was faster but left a stale sha512 in bun.lock — any
# subsequent `bun install` that re-resolved this entry (e.g. when the
# lockfile was touched by another dep) would fail with IntegrityCheckFailed.
#
# `bun remove` first because bun verifies the existing integrity hash
# before replacing the entry; without removing, a stale hash from a prior
# build causes `bun add` itself to fail. The relative `file:../../...`
# path is intentional — an absolute path would leak this machine's
# layout into the lockfile.
echo "Registering tarball with bun (refreshes bun.lock integrity hash)..."
bun pm cache rm
bun remove onesignal-expo-plugin 2>/dev/null || true
bun add file:../../onesignal-expo-plugin.tgz

# Workaround: bun hoists glob@7 from react-native, shadowing glob@13
# needed by @expo/cli. Removing the hoisted copy forces resolution to
# fall through to @expo/cli's own glob@13.
rm -rf node_modules/glob

# Record the hash only after a successful build/install so that an
# interrupted run forces a full retry next time.
echo "$src_hash" > "$STAMP_FILE"
