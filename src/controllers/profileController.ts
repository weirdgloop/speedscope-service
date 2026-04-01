import type { NextFunction, Request, Response } from 'express';
import type {AggregatedProfileType, Profile} from "../../generated/prisma/client.js";
import {prisma} from "../prisma.js";
import {gunzipSync, gzipSync} from "node:zlib";
import escapeHTML from "escape-html";

export const logProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

export const viewProfile = async (
    req: Request,
    res: Response,
) => {
  const { id } = req.params;
  const urlHtml = escapeHTML( `/#profileURL=/profile/${id}` );
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
      <title>Speedscope Profile</title>
  </head>
  <body style="margin: 0; padding: 0; overflow: hidden;">
      <iframe id="speedscopeFrame" style="width: 100%; height: 100vh; border: none;" src="${urlHtml}"></iframe>
  </body>
</html>
`;
  res.status(200).send(html);
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
        parserReport: true,
      }
    }) as Profile | null;
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({
      ...profile,
      parserReport: profile.parserReport ? JSON.parse( profile.parserReport ) : null,
    });
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
