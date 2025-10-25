import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('BoardGateway');
  private activeSockets: Map<string, Set<string>> = new Map(); // boardId -> Set of socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      const payload = this.jwtService.verify(cleanToken);
      client.userId = payload.sub;
      client.email = payload.email;

      this.logger.log(`Client connected: ${client.id} - User: ${client.email}`);
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from all boards
    this.activeSockets.forEach((sockets, boardId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        this.server.to(boardId).emit('user-left', {
          userId: client.userId,
          email: client.email,
        });
      }
    });
  }

  @SubscribeMessage('join-board')
  handleJoinBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string },
  ) {
    const { boardId } = data;
    
    client.join(boardId);
    
    if (!this.activeSockets.has(boardId)) {
      this.activeSockets.set(boardId, new Set());
    }
    this.activeSockets.get(boardId).add(client.id);

    this.logger.log(`User ${client.email} joined board ${boardId}`);
    
    // Notify others in the board
    client.to(boardId).emit('user-joined', {
      userId: client.userId,
      email: client.email,
    });

    return { success: true, message: `Joined board ${boardId}` };
  }

  @SubscribeMessage('leave-board')
  handleLeaveBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string },
  ) {
    const { boardId } = data;
    
    client.leave(boardId);
    
    if (this.activeSockets.has(boardId)) {
      this.activeSockets.get(boardId).delete(client.id);
    }

    this.logger.log(`User ${client.email} left board ${boardId}`);
    
    // Notify others in the board
    client.to(boardId).emit('user-left', {
      userId: client.userId,
      email: client.email,
    });

    return { success: true, message: `Left board ${boardId}` };
  }

  @SubscribeMessage('postit-created')
  handlePostitCreated(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { boardId, postit } = data;
    
    this.logger.log(`Post-it created on board ${boardId} by ${client.email}`);
    
    // Broadcast to all users in the board except the sender
    client.to(boardId).emit('postit-created', {
      postit,
      userId: client.userId,
    });

    return { success: true };
  }

  @SubscribeMessage('postit-updated')
  handlePostitUpdated(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { boardId, postitId, updates } = data;
    
    this.logger.log(`Post-it ${postitId} updated on board ${boardId} by ${client.email}`);
    
    // Broadcast to all users in the board except the sender
    client.to(boardId).emit('postit-updated', {
      postitId,
      updates,
      userId: client.userId,
    });

    return { success: true };
  }

  @SubscribeMessage('postit-deleted')
  handlePostitDeleted(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { boardId, postitId } = data;
    
    this.logger.log(`Post-it ${postitId} deleted on board ${boardId} by ${client.email}`);
    
    // Broadcast to all users in the board except the sender
    client.to(boardId).emit('postit-deleted', {
      postitId,
      userId: client.userId,
    });

    return { success: true };
  }

  @SubscribeMessage('postit-moving')
  handlePostitMoving(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { boardId, postitId, x, y } = data;
    
    // Broadcast real-time position updates
    client.to(boardId).emit('postit-moving', {
      postitId,
      x,
      y,
      userId: client.userId,
    });

    return { success: true };
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { boardId, x, y } = data;
    
    // Broadcast cursor position to others
    client.to(boardId).emit('cursor-move', {
      userId: client.userId,
      email: client.email,
      x,
      y,
    });

    return { success: true };
  }
}
