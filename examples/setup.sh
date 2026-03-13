#!/usr/bin/env bash
set -euo pipefail

ORIGINAL_DIR=$(pwd)

# Build root package
cd ../../
bun run build

rm -f onesignal-expo-plugin.tgz
bun pm pack
mv onesignal-expo-plugin-*.tgz onesignal-expo-plugin.tgz

# Use fresh install of the package
cd "$ORIGINAL_DIR"
bun pm cache rm

bun remove onesignal-expo-plugin
bun add file:../../onesignal-expo-plugin.tgz

# Workaround: bun hoists glob@7 from react-native, shadowing glob@13 needed by @expo/cli
rm -rf node_modules/glob
