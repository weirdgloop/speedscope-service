import {timingSafeEqual} from "node:crypto";
import config from "../config/config.js";
import {Request, Response, NextFunction} from "express";

function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
  const auth = req.headers.authorization;
  const expected = `Bearer ${config.logToken}`;

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const authBuffer = Buffer.from(auth);
  const expectedBuffer = Buffer.from(expected);

  if (authBuffer.length !== expectedBuffer.length) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isValid = timingSafeEqual(authBuffer, expectedBuffer);

  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

export default requireAuth;
