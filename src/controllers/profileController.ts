import type { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import { timingSafeEqual } from 'node:crypto';
import type {AggregatedProfileType, Profile} from "../../generated/prisma/client.js";
import {prisma} from "../prisma.js";
import {gunzipSync, gzipSync} from "node:zlib";

function isAuthenticated(req: Request): boolean {
  const auth = req.headers.authorization;
  const expected = `Bearer ${config.logToken}`;
  if (!auth) return false;
  const authBuffer = Buffer.from(auth);
  const expectedBuffer = Buffer.from(expected);
  if (authBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(authBuffer, expectedBuffer);
}

export const logProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      id,
      wiki,
      url,
      cfRay,
      forced,
      speedscopeData,
      parserReport,
      environment,
    } = req.body;

    const exists = await prisma.profile.findUnique({
      where: { id }
    });
    if (exists) {
      return res
        .status(409)
        .json({ error: 'Profile with this ID already exists' });
    }

    const newProfile = await prisma.profile.create({
      data: {
        id,
        wiki,
        url,
        cfRay,
        forced: Boolean(forced),
        speedscopeData: gzipSync(speedscopeData),
        parserReport: parserReport,
        environment: environment,
      },
    }) as Profile;

    res.status(201).json({
      id: newProfile.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id: id as string }
    }) as Profile | null;
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const data = gunzipSync(profile.speedscopeData).toString();
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    next(error);
  }
};

export const getProfileMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        wiki: true,
        url: true,
        cfRay: true,
        forced: true,
        timestamp: true,
        environment: true,
      }
    }) as Profile | null;
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export const getAggregations = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const {type} = req.params;

    const where = type ? {type: type as AggregatedProfileType} : {};
    const aggregatedProfiles = await prisma.aggregatedProfile.findMany({
      where,
      orderBy: {endTime: 'desc'},
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        profileCount: true,
      }
    });
    res.status(200).json(aggregatedProfiles);
  } catch (error) {
    next(error);
  }
}

export const getLatestAggregation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findFirst({
      where: { type: type as AggregatedProfileType },
      orderBy: { endTime: 'desc' },
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'No aggregated profiles found' });
    }

    const data = gunzipSync(aggregatedProfile.speedscopeData).toString();
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    next(error);
  }
};

export const getLatestAggregationMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { type } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findFirst({
      where: { type: type as AggregatedProfileType },
      orderBy: { endTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        profileCount: true,
      }
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'No aggregated profiles found' });
    }

    res.status(200).json(aggregatedProfile);
  } catch (error) {
    next(error);
  }
}

export const getLatestFrameTimingData = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { type } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findFirst({
      where: { type: type as AggregatedProfileType },
      orderBy: { endTime: 'desc' },
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'No aggregated profiles found' });
    }

    const data = gunzipSync(aggregatedProfile.frameTimingData).toString();
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    next(error);
  }
};

export const getAggregationById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findUnique({
      where: { id: Number(id) },
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'Aggregated profile not found' });
    }

    const data = gunzipSync(aggregatedProfile.speedscopeData).toString();
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    next(error);
  }
}

export const getAggregationMetadataById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        profileCount: true,
      }
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'Aggregated profile not found' });
    }

    res.status(200).json(aggregatedProfile);
  } catch (error) {
    next(error);
  }
}

export const getAggregationFrameTimingDataById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const aggregatedProfile = await prisma.aggregatedProfile.findUnique({
      where: { id: Number(id) },
    });
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'Aggregated profile not found' });
    }

    const data = gunzipSync(aggregatedProfile.frameTimingData).toString();
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    next(error);
  }
}
