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
bun i
