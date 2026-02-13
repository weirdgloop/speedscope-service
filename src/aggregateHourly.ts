import {aggregateSpeedscopeData} from './repositories/profileRepository.js';
import {prisma} from "./prisma.js";
import {gzipSync} from "node:zlib";
import {AggregatedProfileType, Profile} from "../generated/prisma/client.js";

const end = new Date();
const start = new Date(end.getTime() - (60 * 60 * 1000)); // 1 hour ago

const profiles: Profile[] = await prisma.profile.findMany({
  where: {
    timestamp: {
      gte: start,
    },
    forced: false,
  },
  orderBy: {
    timestamp: 'asc',
  },
});

if (profiles.length === 0) {
  console.log('No profiles found in the last hour.');
  process.exit(0);
}
const aggregatedData = aggregateSpeedscopeData(profiles);
await prisma.aggregatedProfile.create({
  data: {
    startTime: start,
    endTime: end,
    type: AggregatedProfileType.HOURLY,
    profileCount: profiles.length,
    speedscopeData: gzipSync(JSON.stringify(aggregatedData.file)),
    frameTimingData: gzipSync(JSON.stringify(aggregatedData.frameTimings, (k, v) => {
      if (v instanceof Map) {
        return Array.from(v.entries());
      }
      return v;
    })),
  }
});

// Delete all profiles (except for forced ones) that were created before this script has started
// running. This way we ensure there aren't any orphaned ones remaining in the DB
await prisma.profile.deleteMany({
  where: {
    timestamp: {
      lte: end,
    },
    forced: false,
  },
});
