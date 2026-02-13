import { Router } from 'express';
import {
  aggregate, getFrameTimingData,
  getProfile,
  logProfile,
} from '../controllers/profileController.js';
import {body, query} from 'express-validator';
import { handleValidationErrors } from '../middlewares/errorHandler.js';
import cors from 'cors';
import config from "../config/config.js";
import {AggregatedProfileType} from "../../generated/prisma/enums.js";

const router = Router();

router.get(
  '/get', [
    query('id').isString().notEmpty(),
  ],
  cors({
    origin: config.allowedOrigin,
  }),
  handleValidationErrors,
  getProfile
);

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
    '/aggregate',
    cors({
      origin: config.allowedOrigin,
    }),
    [
      query('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    aggregate
);

// TODO rename / move
router.get(
    '/frame-timings',
    [
      query('type').exists().isIn([AggregatedProfileType.HOURLY, AggregatedProfileType.DAILY])
    ],
    handleValidationErrors,
    getFrameTimingData
);

export default router;
