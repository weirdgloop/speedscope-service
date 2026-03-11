import {aggregateSpeedscopeData} from "./repositories/profileRepository.js";
import {AggregatedProfileType} from "../generated/prisma/enums.js";
import {gzipSync} from "node:zlib";
import {prisma} from "./prisma.js";
import {AggregatedProfile} from "../generated/prisma/client.js";
import config from "./config/config.js";

const end = new Date();
const start = new Date(end.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago

const aggregatedProfiles: AggregatedProfile[] = await prisma.aggregatedProfile.findMany({
  where: {
    startTime: {
      gte: start,
    },
    type: AggregatedProfileType.HOURLY,
  },
  orderBy: {
    startTime: 'asc',
  },
});

if (!aggregatedProfiles || aggregatedProfiles.length === 0) {
  console.log('No profiles found in the last day.');
  process.exit(0);
}

const aggregatedData = aggregateSpeedscopeData(
    aggregatedProfiles,
    `Daily aggregation (${start.toISOString()} to ${end.toISOString()})`
);
await prisma.aggregatedProfile.create({
  data: {
    startTime: start,
    endTime: end,
    type: AggregatedProfileType.DAILY,
    profileCount: aggregatedProfiles
      .map((p) => p.profileCount)
      .reduce((a, b) => a + b, 0),
    speedscopeData: gzipSync(JSON.stringify(aggregatedData.file)),
    frameTimingData: gzipSync(JSON.stringify(aggregatedData.frameTimings, (k, v) => {
      if (v instanceof Map) {
        return Array.from(v.entries());
      }
      return v;
    })),
  }
});

if ( config.purgeHourlyAggregations ) {
  await prisma.aggregatedProfile.deleteMany({
    where: {
      endTime: {
        lte: end,
      },
      type: AggregatedProfileType.HOURLY,
    },
  });
}
