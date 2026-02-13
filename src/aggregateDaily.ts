import {aggregateSpeedscopeData} from "./repositories/profileRepository.js";
import {AggregatedProfileType} from "../generated/prisma/enums.js";
import {gunzipSync, gzipSync} from "node:zlib";
import {prisma} from "./prisma.js";
import {AggregatedProfile} from "../generated/prisma/client.js";

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

const aggregatedData = aggregateSpeedscopeData(aggregatedProfiles);
await prisma.aggregatedProfile.create({
  data: {
    startTime: start,
    endTime: end,
    type: AggregatedProfileType.DAILY,
    profileCount: aggregatedProfiles
      .map((p) => p.profileCount)
      .reduce((a, b) => a + b, 0),
    speedscopeData: gzipSync(JSON.stringify(aggregatedData)),
  }
});

await prisma.aggregatedProfile.deleteMany({
  where: {
    endTime: {
      lte: end,
    },
    type: AggregatedProfileType.HOURLY,
  },
});
