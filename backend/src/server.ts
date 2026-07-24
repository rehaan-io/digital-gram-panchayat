import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing app
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import { WebSocketService } from './services/websocket.service';

const PORT = process.env.PORT || 5000;

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('\n-------------------------------------------------------------');
  console.log(`🚀 Gram Panchayat Server is running on port ${PORT}`);
  console.log(`👉 API Health Check: http://localhost:${PORT}/`);
  console.log(`📂 Uploads Directory: http://localhost:${PORT}/uploads/`);
  console.log('-------------------------------------------------------------\n');
});

WebSocketService.init(server);
