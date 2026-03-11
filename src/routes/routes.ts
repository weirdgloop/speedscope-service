import { Router } from 'express';
import {
  getAggregationById,
  getAggregationFrameTimingDataById,
  getAggregationMetadataById,
  getAggregations,
  getLatestAggregation,
  getLatestAggregationMetadata,
  getLatestFrameTimingData,
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
    '/aggregations',
    getAggregations
)

router.get(
    '/aggregations/:type',
    [
      param('type').notEmpty().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getAggregations
)

router.get(
    '/aggregation/latest/:type',
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
    '/aggregation/latest/:type/metadata',
    [
      param('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getLatestAggregationMetadata
);

router.get(
    '/aggregation/latest/:type/frame-timings',
    [
      param('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getLatestFrameTimingData
);

router.get(
    '/aggregation/:id',
    cors({
      origin: config.allowedOrigin,
    }),
    [
      param('id').isInt(),
    ],
    handleValidationErrors,
    getAggregationById
);

router.get(
    '/aggregation/:id/metadata',
    cors({
      origin: config.allowedOrigin,
    }),
    [
      param('id').isInt(),
    ],
    handleValidationErrors,
    getAggregationMetadataById
);

router.get(
    '/aggregation/:id/frame-timings',
    [
      param('id').isInt(),
    ],
    handleValidationErrors,
    getAggregationFrameTimingDataById
);

export default router;
