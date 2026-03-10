docker run --rm \
  --env-file .env \
  -v "$(pwd)/db:/db:rw" \
  -p 3001:3000 \
  ghcr.io/somemwdev/speedscope-service:main \
  node dist/src/aggregateDaily.js
