import {SpeedscopeFile} from "../models/speedscope";
import {pipeline} from "node:stream/promises";
import {Replacer, stringifyChunked} from "@discoveryjs/json-ext";
import {arrayBuffer} from "node:stream/consumers";
import {FrameTimings} from "../repositories/profileRepository";

const jsonifyAndCompress = async (
    obj: unknown,
    replacer?: Replacer
): Promise<Uint8Array<ArrayBuffer>> => {
  const compressionStream = new CompressionStream("gzip");
  const [buffer] = await Promise.all([
    arrayBuffer(compressionStream.readable),
    pipeline(stringifyChunked(obj, replacer), compressionStream.writable),
  ]);
  return Buffer.from(buffer);
};

export const jsonifyAndCompressProfile = async (
    profile: SpeedscopeFile
): Promise<Uint8Array<ArrayBuffer>> => {
  return jsonifyAndCompress(profile);
};

export const jsonifyAndCompressFrameTimings = async (
    frameTimings: FrameTimings
): Promise<Uint8Array<ArrayBuffer>> => {
  return jsonifyAndCompress(frameTimings, (k, v) => {
    if (v instanceof Map) {
      return Array.from(v.entries());
    }
    return v;
  });
};
