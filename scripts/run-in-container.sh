#!/usr/bin/env bash
set -euo pipefail

IMAGE="ghcr.io/somemwdev/speedscope-service:main"

docker run --rm \
  --env-file .env \
  -v "$(pwd)/db:/db:rw" \
  -p 3001:3000 \
  "$IMAGE" \
  "$@"
