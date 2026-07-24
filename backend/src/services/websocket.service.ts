import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WebSocketService {
  private static wss: WebSocketServer | null = null;
  private static userSockets = new Map<string, Set<AuthenticatedWebSocket>>();

  static init(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      ws.isAlive = true;

      // Extract token from query params: /?token=XYZ
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');

      if (!token) {
        console.warn('❌ WebSocket connection rejected: Missing auth token');
        ws.close(4001, 'Unauthorized: Missing Token');
        return;
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'gram_panchayat_super_secure_secret_key_2026_redist'
        ) as { id: string };
        
        ws.userId = decoded.id;
        
        // Add to tracking map
        if (!this.userSockets.has(decoded.id)) {
          this.userSockets.set(decoded.id, new Set());
        }
        this.userSockets.get(decoded.id)!.add(ws);
        console.log(`🔌 WebSocket connected for user: ${decoded.id}`);

      } catch (err) {
        console.warn('❌ WebSocket connection rejected: Invalid auth token');
        ws.close(4002, 'Unauthorized: Invalid Token');
        return;
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        if (ws.userId) {
          const userSet = this.userSockets.get(ws.userId);
          if (userSet) {
            userSet.delete(ws);
            if (userSet.size === 0) {
              this.userSockets.delete(ws.userId);
            }
          }
          console.log(`❌ WebSocket closed for user: ${ws.userId}`);
        }
      });

      ws.on('error', (err) => {
        console.error(`WebSocket error for user ${ws.userId}:`, err);
      });
    });

    // Setup ping interval to keep connections alive and clean up dead sockets
    const interval = setInterval(() => {
      this.wss?.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          console.log(`🧹 Terminating inactive WebSocket connection for user: ${ws.userId}`);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  /**
   * Sends a real-time event to a specific user if they are online.
   */
  static sendToUser(userId: string, event: string, payload: any) {
    const userSet = this.userSockets.get(userId);
    if (!userSet) return false;

    const data = JSON.stringify({ event, payload });
    userSet.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
    return true;
  }

  /**
   * Broadcasts a real-time event to all connected clients.
   */
  static broadcast(event: string, payload: any) {
    if (!this.wss) return;

    const data = JSON.stringify({ event, payload });
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}
