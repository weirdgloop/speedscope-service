#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="ghcr.io/weirdgloop/speedscope-service:main"

docker run --rm \
  --env-file "$SCRIPT_DIR/../.env" \
  -v "$SCRIPT_DIR/../db:/db:rw" \
  -p 3001:3000 \
  "$IMAGE" \
  "$@"
