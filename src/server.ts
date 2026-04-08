import { existsSync, unlinkSync } from 'node:fs';
import app from './app.js';
import config from './config/config.js';

if (config.unixSocket && existsSync(config.unixSocket)) {
  unlinkSync(config.unixSocket);
}
app.listen(config.unixSocket ?? config.port, () => {
  if (config.unixSocket) {
    console.log(`Server running on Unix socket ${config.unixSocket}`);
  } else {
    console.log(`Server running on port ${config.port}`);
  }
});
