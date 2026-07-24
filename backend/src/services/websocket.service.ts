import { Server as SocketIOServer, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketService {
  private static io: SocketIOServer | null = null;

  static init(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Allow all origins for dev/prod compatibility
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      },
      transports: ['websocket'], // Use WebSocket transport for React Native stability
    });

    // Socket.IO authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        console.warn('❌ Socket.IO connection rejected: Missing auth token');
        return next(new Error('Authentication error: Missing token'));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'gram_panchayat_super_secure_secret_key_2026_redist'
        ) as { id: string; role: string };

        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        console.warn('❌ Socket.IO connection rejected: Invalid auth token');
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.userId || !socket.userRole) return;

      const userId = socket.userId;
      const role = socket.userRole;

      // 1. Join user-specific room: user_{userId}
      socket.join(`user_${userId}`);
      console.log(`🔌 Socket.IO: User ${userId} joined room user_${userId}`);

      // 2. Join role-specific rooms
      if (role === 'ADMIN') {
        socket.join('admin_room');
        console.log(`🔌 Socket.IO: Admin ${userId} joined room admin_room`);
      } else if (role === 'EMPLOYEE') {
        socket.join('employee_room');
        console.log(`🔌 Socket.IO: Employee ${userId} joined room employee_room`);
      }

      socket.on('disconnect', () => {
        console.log(`❌ Socket.IO: User ${userId} disconnected`);
      });
    });
  }

  /**
   * Sends a real-time event to a specific user if they are online.
   */
  static sendToUser(userId: string, event: string, payload: any) {
    if (!this.io) return false;
    this.io.to(`user_${userId}`).emit(event, payload);
    return true;
  }

  /**
   * Broadcasts a real-time event to all connected clients.
   */
  static broadcast(event: string, payload: any) {
    if (!this.io) return;
    this.io.emit(event, payload);
  }

  /**
   * Sends a real-time event to a specific room.
   */
  static sendToRoom(room: string, event: string, payload: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, payload);
  }
}
