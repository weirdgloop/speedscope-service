import type {
  SpeedscopeFile, SpeedscopeFrame,
} from '../models/speedscope.js';
import {AggregatedProfile, Profile} from "../../generated/prisma/client";
import {gunzipSync} from "node:zlib";
import config from "../config/config.js";

export interface AggregationResult {
  file: SpeedscopeFile;
  frameTimings: Map<string, Map<string, number>>;
}

/**
 * @param data Array of profiles to aggregate. Must contain at least one entry.
 * @param name The name to assign to the aggregated profile.
 */
export function aggregateSpeedscopeData(data: (Profile|AggregatedProfile)[], name: string): AggregationResult {
  if (data.length === 0) {
    throw new Error('No data to aggregate!');
  }

  const peakMemoryUsages = new Map<string, number>();

  function trackMemory(label: string) {
    if ( !config.trackAggregationMemory ) {
      return;
    }
    const rss = process.memoryUsage().rss;
    peakMemoryUsages.set(label, Math.max(peakMemoryUsages.get(label) ?? 0, rss));
  }

  const globalFrames = new Map<string, number>();
  const frameTimings: Map<string, Map<string, number>> = new Map();
  const globalFramesRev: SpeedscopeFrame[] = [];
  const globalSamples = new Map<string, number>();
  let json: SpeedscopeFile | undefined;

  console.log(`Starting aggregation of ${data.length} profiles...`);
  data.forEach((profile) => {
    const rawData = gunzipSync(profile.speedscopeData).toString();
    json = JSON.parse(rawData) as SpeedscopeFile;
    const frames = json.shared.frames;
    const local2GlobalFrames = new Map<number, number>();
    frames.forEach((frame, i) => {
      const frameJson = JSON.stringify(frame);
      if (!globalFrames.has(frameJson)) {
        globalFrames.set(frameJson, globalFrames.size);
        globalFramesRev.push(frame);
      }
      local2GlobalFrames.set(i, globalFrames.get(frameJson)!);
    });

    for (const [i, sample] of json.profiles[0]!.samples.entries()) {
      const weight = json.profiles[0]!.weights[i]!;
      const mappedSample = sample.map((s: number) => local2GlobalFrames.get(s));
      for (const mappedSampleIndex of mappedSample) {
        const frameName = globalFramesRev[mappedSampleIndex!].name;
        if (!frameTimings.has(frameName)) {
          frameTimings.set(frameName, new Map<string, number>());
        }
        const map = frameTimings.get(frameName)!;
        const id = profile.id.toString();
        if (!map.has(id)) {
          map.set(id, 0);
        }
        map.set(id, map.get(id)! + weight);
      }
      const mappedSampleKey = mappedSample.join(',');
      globalSamples.set(
        mappedSampleKey,
        (globalSamples.get(mappedSampleKey) ?? 0) + weight,
      );
    }
    trackMemory('profile-loading');
  });

  console.log(`Aggregated to ${globalSamples.size} unique samples and ${globalFrames.size} unique frames.`);
  console.log('Sorting samples...');
  const globalSort = new Map<string, number>();
  globalSamples.forEach((weight, sample) => {
    const arr = sample.split(',').map(Number);
    for (let i = 0; i < arr.length; i++) {
      const key = arr.slice(0, i).join(',');
      globalSort.set(key, (globalSort.get(key) ?? 0) + weight);
    }
    trackMemory('sample-sorting');
  });

  const globalSortTuples = new Map<string, number[]>();

  console.log('Creating sort tuples...');
  for (const sample of globalSamples.keys()) {
    const arr = sample.split(',').map(Number);
    const values: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const key = arr.slice(0, i).join(',');
      values.push(-(globalSort.get(key) ?? 0));
    }

    globalSortTuples.set(sample, values);
    trackMemory('tuple-creation');
  }

  console.log('Sorting tuples...');
  const tuples = Array.from(globalSamples.entries());
  tuples.sort((a, b) => {
    const ta = globalSortTuples.get(a[0])!;
    const tb = globalSortTuples.get(b[0])!;
    for (let i = 0; i < Math.min(ta.length, tb.length); i++) {
      if (ta[i] !== tb[i]) return ta[i]! - tb[i]!;
    }
    trackMemory('tuple-sorting');
    return ta.length - tb.length;
  });

  console.log('Rebuilding aggregated profile...');
  json!.profiles[0]!.samples = tuples.map(([key]) => key.split(',').map(Number));
  json!.profiles[0]!.weights = tuples.map(([, weight]) => weight);
  json!.profiles[0]!.name = name;
  json!.shared.frames = globalFramesRev;
  trackMemory('profile-rebuilding');

  console.log('Aggregation complete.');
  if (config.trackAggregationMemory) {
    for (const [label, memory] of peakMemoryUsages.entries()) {
      console.log(`Peak memory usage during ${label}: ${(memory / (1024 * 1024)).toFixed(2)} MB`);
    }
  }
  return {
    file: json!,
    frameTimings: frameTimings,
  };
}
