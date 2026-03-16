# speedscope-service

A simple web service that stores, serves and
aggregates [speedscope profiles](https://github.com/jlfwong/speedscope/blob/main/src/lib/file-format-spec.ts).

## Routes

* `/profile/[id]` - Get a single unaggregated profile in the Speedscope JSON format by id.
* `/metadata/[id]` - Get metadata about a profile by id.
* `/log` - Log a profile. Expects a JSON body with the following format:

```json
{
  "id": "unique-profile-id",
  "wiki": "examplewiki",
  "url": "https://example.com/",
  "cfRay": "cloudflare-ray-id",
  "forced": false,
  "speedscopeData": "...",
  "parserReport": "...",
  "environment": "prod"
}
```

* `/aggregations` - Get a list of all aggregated profiles, with their IDs, start and end times,
  types and the number of profiles that were aggregated into them.
* `/aggregations/[type]` - Get a list of all aggregated profiles of a specific type, with their IDs,
  start and end times, types and the number of profiles that were aggregated into them.
* `/aggregation/latest/[type]` - Get the latest aggregated speedscope profile of a specific type.
* `/aggregation/latest/[type]/metadata` - Get metadata about the latest aggregated profile of a
  specific type.
* `/aggregation/latest/[type]/frame-timings` - Get the frame timings of the latest aggregated
  profile of a specific type.
* `/aggregation/[id]` - Get an aggregated speedscope profile by id.
* `/aggregation/[id]/metadata` - Get metadata about an aggregated profile by id.
* `/aggregation/[id]/frame-timings` - Get the frame timings of an aggregated profile by id.
