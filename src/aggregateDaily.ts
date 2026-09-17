import {aggregateSpeedscopeData, AggregationResult} from "./repositories/profileRepository.js";
import {AggregatedProfileType} from "../generated/prisma/enums.js";
import {gzipSync} from "node:zlib";
import {prisma} from "./prisma.js";
import {AggregatedProfile} from "../generated/prisma/client.js";
import config from "./config/config.js";

const end = new Date();
const start = new Date(end.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago

const aggregateData = async ( start: Date, end: Date ) => {
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

  const profileCount = aggregatedProfiles
    .map((p) => p.profileCount)
    .reduce((a, b) => a + b, 0);

  return { aggregatedData: aggregatedData, profileCount: profileCount };
};

const compressFrameTimings = ( aggregatedData: AggregationResult ) => {
  console.log('Converting frame timings to JSON...');
  const frameTimingJson = JSON.stringify(aggregatedData.frameTimings, (k, v) => {
    if (v instanceof Map) {
      return Array.from(v.entries());
    }
    return v;
  });
  delete aggregatedData.frameTimings;
  console.log('Compressing frame timings...');
  return gzipSync(frameTimingJson);
};

const compressProfile = ( aggregatedData: AggregationResult ) => {
  console.log('Converting profile to JSON...');
  const profileJson = JSON.stringify(aggregatedData.file);
  delete aggregatedData.file;
  console.log('Compressing profile...');
  return gzipSync(profileJson);
};

const { aggregatedData, profileCount } = await aggregateData( start, end );
const compressedProfile = compressProfile( aggregatedData );
const compressedFrameTimings = compressFrameTimings( aggregatedData );

console.log('Writing data to DB...');

await prisma.aggregatedProfile.create({
  data: {
    startTime: start,
    endTime: end,
    type: AggregatedProfileType.DAILY,
    profileCount: profileCount,
    speedscopeData: compressedProfile,
    frameTimingData: compressedFrameTimings,
  }
});

if (config.purgeHourlyAggregations) {
  console.log('Purging hourly aggregations...');
  await prisma.aggregatedProfile.deleteMany({
    where: {
      endTime: {
        lte: end,
      },
      type: AggregatedProfileType.HOURLY,
    },
  });
}

console.log('Done!');
