import {
  aggregateSpeedscopeData,
  FrameTimings,
} from './repositories/profileRepository.js';
import { AggregatedProfileType } from '../generated/prisma/enums.js';
import { prisma } from './prisma.js';
import { AggregatedProfile } from '../generated/prisma/client.js';
import config from './config/config.js';
import { jsonifyAndCompressFrameTimings, jsonifyAndCompressProfile } from './utils/jsonHelper.js';
import { SpeedscopeFile } from './models/speedscope';

const end = new Date();
const start = new Date(end.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago

const aggregateData = async (start: Date, end: Date) => {
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
    `Daily aggregation (${start.toISOString()} to ${end.toISOString()})`,
  );

  const profileCount = aggregatedProfiles
    .map(p => p.profileCount)
    .reduce((a, b) => a + b, 0);

  return { aggregatedData: aggregatedData, profileCount: profileCount };
};

const { aggregatedData, profileCount } = await aggregateData(start, end);
console.log('Compressing profile...');
const compressedProfile = await jsonifyAndCompressProfile(aggregatedData.file as SpeedscopeFile);
delete aggregatedData.file;
console.log('Compressing frame timings...');
const compressedFrameTimings = await jsonifyAndCompressFrameTimings(aggregatedData.frameTimings as FrameTimings);
delete aggregatedData.frameTimings;

console.log('Writing data to DB...');

await prisma.aggregatedProfile.create({
  data: {
    startTime: start,
    endTime: end,
    type: AggregatedProfileType.DAILY,
    profileCount: profileCount,
    speedscopeData: compressedProfile,
    frameTimingData: compressedFrameTimings,
  },
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
