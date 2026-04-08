# speedscope-service

A simple web service that stores, serves and
aggregates [speedscope profiles](https://github.com/jlfwong/speedscope/blob/main/src/lib/file-format-spec.ts).

## Routes

### Viewing profiles

* `/view/[id]` - View a single unaggregated profile by id.
* `/view/aggregation/[id]` - View an aggregated profile by id.
* `/view/aggregation/latest/[type]` - View the latest aggregated profile of a specific type.

### Getting profiles and related data

* `/profile/[id]` - Get a single unaggregated profile in the Speedscope JSON format by id.
* `/metadata/[id]` - Get metadata about a profile by id.

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

### Storing profiles

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

## Cronjobs

To generate hourly and daily aggregations, you need to run two scripts via cronjobs. Example:
```cronexp
0 * * * * bash /srv/speedscope/scripts/aggregate-hourly.sh 2>&1 | while read line; do echo "$(date '+\%Y-\%m-\%d \%H:\%M:\%S') $line"; done >> /var/log/speedscope/cron-hourly.log
30 0 * * * bash /srv/speedscope/scripts/aggregate-daily.sh 2>&1 | while read line; do echo "$(date '+\%Y-\%m-\%d \%H:\%M:\%S') $line"; done >> /var/log/speedscope/cron-daily.log
```
The daily aggregation is run at 00:30 as it can be quite memory intensive and shouldn't be run at 
the same time as the hourly aggregation.
