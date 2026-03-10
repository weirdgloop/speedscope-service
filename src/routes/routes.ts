import { Router } from 'express';
import {
  getFrameTimingData,
  getLatestAggregation,
  getProfile,
  getProfileMetadata,
  logProfile,
} from '../controllers/profileController.js';
import {body, param} from 'express-validator';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import cors from 'cors';
import config from "../config/config.js";
import {AggregatedProfileType} from "../../generated/prisma/enums.js";

const router = Router();

router.get(
  '/profile/:id', [
    param('id').isString().notEmpty(),
  ],
  cors({
    origin: config.allowedOrigin,
  }),
  handleValidationErrors,
  getProfile
);

router.get(
    '/metadata/:id',
    [
      param('id').isString().notEmpty(),
    ],
    handleValidationErrors,
    getProfileMetadata
)

router.post('/log', [
  body('id').isString().notEmpty(),
  body('wiki').isString().notEmpty(),
  body('url').isString().notEmpty(),
  body('cfRay').isString().notEmpty(),
  body('forced').isBoolean(),
  body('speedscopeData').isString(),
  body('parserReport').optional(),
  body('environment').isString().notEmpty(),
], handleValidationErrors, logProfile);

router.get(
    '/latest/aggregation/:type',
    cors({
      origin: config.allowedOrigin,
    }),
    [
      param('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getLatestAggregation
);

router.get(
    '/latest/frame-timings/:type',
    [
      param('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getFrameTimingData
);

export default router;
