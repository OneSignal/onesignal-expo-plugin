#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(pwd -P)
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
TARBALL="$PLUGIN_ROOT/onesignal-expo-plugin.tgz"
INSTALL_STAMP="$DEMO_DIR/.expo-plugin-source.stamp"
INSTALLED_DIR="$DEMO_DIR/node_modules/onesignal-expo-plugin"

cd "$PLUGIN_ROOT"
vp run build

# Keep the stable archive when its bytes are unchanged so file dependency
# installers do not invalidate their caches unnecessarily.
rm -f onesignal-expo-plugin-*.tgz
vp pm pack
new_tarball=(onesignal-expo-plugin-*.tgz)
if [ -f "$TARBALL" ] && cmp -s "${new_tarball[0]}" "$TARBALL"; then
  rm "${new_tarball[0]}"
  echo "Plugin package unchanged; using cached onesignal-expo-plugin.tgz."
else
  mv "${new_tarball[0]}" "$TARBALL"
  echo "Plugin package changed; refreshed onesignal-expo-plugin.tgz."
fi

tarball_hash=$(shasum "$TARBALL" | awk '{print $1}')
if [ "${FORCE_SETUP:-0}" != "1" ] \
   && [ -d "$INSTALLED_DIR" ] \
   && [ -f "$INSTALL_STAMP" ] \
   && [ "$(cat "$INSTALL_STAMP")" = "$tarball_hash" ]; then
  echo "Demo already has this plugin package; skipping reinstall."
  exit 0
fi

# Always go through vp add so vp.lock's integrity hash for the tarball
# stays in sync with the freshly-built tarball on disk. A previous version
# of this script had a "hot path" that just untarred over node_modules
# directly, which was faster but left a stale sha512 in bun.lock — any
# subsequent `vp install` that re-resolved this entry (e.g. when the
# lockfile was touched by another dep) would fail with IntegrityCheckFailed.
#
# `vp remove` first because vp verifies the existing integrity hash
# before replacing the entry; without removing, a stale hash from a prior
# build causes `vp add` itself to fail. The relative `file:../../...`
# path is intentional — an absolute path would leak this machine's
# layout into the lockfile.
cd "$DEMO_DIR"
echo "Registering tarball with vp (refreshes bun.lock integrity hash)..."
vp remove onesignal-expo-plugin 2>/dev/null || true
vp add file:../../onesignal-expo-plugin.tgz

# Record the installed archive only after a successful install.
echo "$tarball_hash" > "$INSTALL_STAMP"
