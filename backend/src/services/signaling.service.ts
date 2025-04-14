import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { getMediasoupService, initializeMediasoupService } from './mediasoup.service';

// 客户端连接类型
interface Client {
  id: string;
  socket: WebSocket;
  roomId?: string;
  userId?: string;
  isProducer: boolean;
}

// 房间结构
interface Room {
  id: string;
  clients: Map<string, Client>;
  producers: Map<string, Client>;
}

// 消息类型
interface SignalingMessage {
  type: string;
  roomId?: string;
  userId?: string;
  targetId?: string;
  data?: any;
}

export class SignalingService {
  private wss: WebSocket.Server;
  private clients: Map<string, Client> = new Map();
  private rooms: Map<string, Room> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocketServer();
    console.log('WebSocket 信令服务已初始化');

    // 初始化mediasoup服务
    initializeMediasoupService().catch(err => {
      console.error('mediasoup服务初始化失败:', err);
    });
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (socket: WebSocket) => {
      const clientId = uuidv4();
      const client: Client = {
        id: clientId,
        socket,
        isProducer: false
      };
      
      this.clients.set(clientId, client);
      console.log(`客户端已连接: ${clientId}, 当前连接数: ${this.clients.size}`);

      // 发送连接确认
      this.sendToClient(client, {
        type: 'connected',
        data: { clientId }
      });

      // 处理消息
      socket.on('message', (message: WebSocket.Data) => {
        try {
          const msg: SignalingMessage = JSON.parse(message.toString());
          this.handleMessage(client, msg);
        } catch (error) {
          console.error('解析消息失败:', error);
          this.sendToClient(client, {
            type: 'error',
            data: { message: '无效的消息格式' }
          });
        }
      });

      // 处理连接关闭
      socket.on('close', () => {
        this.handleClientDisconnect(client);
      });

      // 处理错误
      socket.on('error', (err: Error) => {
        console.error(`客户端 ${clientId} 错误:`, err);
      });
    });
  }

  private handleMessage(client: Client, message: SignalingMessage): void {
    console.log(`收到来自客户端 ${client.id} 的消息: ${message.type}`);

    switch (message.type) {
      case 'joinRoom':
        this.handleJoinRoom(client, message);
        break;
      case 'leaveRoom':
        this.handleLeaveRoom(client);
        break;
      case 'relaySdp':
        this.handleRelaySdp(client, message);
        break;
      case 'relayIceCandidate':
        this.handleRelayIceCandidate(client, message);
        break;
      case 'getRouterRtpCapabilities':
        this.handleGetRouterRtpCapabilities(client, message);
        break;
      case 'createTransport':
        this.handleCreateTransport(client, message);
        break;
      case 'connectTransport':
        this.handleConnectTransport(client, message);
        break;
      case 'produce':
        this.handleProduce(client, message);
        break;
      case 'consume':
        this.handleConsume(client, message);
        break;
      case 'resumeConsumer':
        this.handleResumeConsumer(client, message);
        break;
      default:
        console.warn(`未知消息类型: ${message.type}`);
        this.sendToClient(client, {
          type: 'error',
          data: { message: '未知的消息类型' }
        });
    }
  }

  private async handleJoinRoom(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId, userId, isProducer } = message.data || {};
    
    if (!roomId) {
      return this.sendToClient(client, {
        type: 'error',
        data: { message: '缺少房间ID' }
      });
    }

    // 更新客户端信息
    client.roomId = roomId;
    client.userId = userId;
    client.isProducer = !!isProducer;

    // 获取或创建房间
    let room = this.rooms.get(roomId);
    if (!room) {
      room = { id: roomId, clients: new Map(), producers: new Map() };
      this.rooms.set(roomId, room);

      // 为新房间创建mediasoup router
      const mediasoupService = getMediasoupService();
      if (mediasoupService) {
        await mediasoupService.createRouter(roomId);
      }
    }

    // 将客户端添加到房间
    room.clients.set(client.id, client);
    
    // 如果是生产者，添加到生产者列表
    if (client.isProducer) {
      room.producers.set(client.id, client);
    }

    console.log(`客户端 ${client.id} 加入房间 ${roomId}, 当前房间人数: ${room.clients.size}`);

    // 向客户端发送加入成功消息
    this.sendToClient(client, {
      type: 'roomJoined',
      roomId,
      data: { 
        roomId,
        clients: Array.from(room.clients.values()).map(c => ({
          id: c.id,
          userId: c.userId,
          isProducer: c.isProducer
        })),
        producers: Array.from(room.producers.values()).map(p => ({
          id: p.id,
          userId: p.userId
        }))
      }
    });

    // 通知房间其他人有新客户端加入
    this.broadcastToRoom(roomId, {
      type: 'clientJoined',
      roomId,
      data: {
        clientId: client.id,
        userId: client.userId,
        isProducer: client.isProducer
      }
    }, [client.id]);
  }

  private handleLeaveRoom(client: Client): void {
    const { roomId } = client;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // 从房间移除客户端
    room.clients.delete(client.id);
    
    // 如果是生产者，也从生产者列表移除
    if (client.isProducer) {
      room.producers.delete(client.id);
    }

    console.log(`客户端 ${client.id} 离开房间 ${roomId}, 当前房间人数: ${room.clients.size}`);

    // 关闭客户端在mediasoup中的所有资源
    const mediasoupService = getMediasoupService();
    if (mediasoupService) {
      // 关闭生产者传输
      mediasoupService.closeTransport(roomId, `producer_${client.id}`);
      // 关闭消费者传输
      mediasoupService.closeTransport(roomId, `consumer_${client.id}`);
    }

    // 通知房间其他人客户端已离开
    this.broadcastToRoom(roomId, {
      type: 'clientLeft',
      roomId,
      data: {
        clientId: client.id,
        userId: client.userId
      }
    });

    // 清除客户端房间信息
    client.roomId = undefined;

    // 如果房间为空，删除房间
    if (room.clients.size === 0) {
      this.rooms.delete(roomId);
      
      // 关闭mediasoup房间资源
      if (mediasoupService) {
        mediasoupService.closeRoom(roomId);
      }

      console.log(`房间 ${roomId} 已经没有客户端，已删除`);
    }
  }

  private handleClientDisconnect(client: Client): void {
    console.log(`客户端 ${client.id} 断开连接`);
    
    // 如果客户端在房间中，处理离开房间
    if (client.roomId) {
      this.handleLeaveRoom(client);
    }
    
    // 从客户端列表移除
    this.clients.delete(client.id);
  }

  private handleRelaySdp(client: Client, message: SignalingMessage): void {
    const { targetId, data } = message;
    if (!targetId || !data || !client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (!room) return;

    const targetClient = room.clients.get(targetId);
    if (!targetClient) return;

    // 转发SDP
    this.sendToClient(targetClient, {
      type: 'sdp',
      data: {
        senderId: client.id,
        senderUserId: client.userId,
        sdp: data.sdp
      }
    });
  }

  private handleRelayIceCandidate(client: Client, message: SignalingMessage): void {
    const { targetId, data } = message;
    if (!targetId || !data || !client.roomId) return;

    const room = this.rooms.get(client.roomId);
    if (!room) return;

    const targetClient = room.clients.get(targetId);
    if (!targetClient) return;

    // 转发ICE候选者
    this.sendToClient(targetClient, {
      type: 'iceCandidate',
      data: {
        senderId: client.id,
        senderUserId: client.userId,
        candidate: data.candidate
      }
    });
  }

  private async handleGetRouterRtpCapabilities(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId } = client;
    if (!roomId) return;

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const rtpCapabilities = mediasoupService.getRouterRtpCapabilities(roomId);
    if (!rtpCapabilities) return;

    this.sendToClient(client, {
      type: 'routerRtpCapabilities',
      data: { 
        roomId,
        capabilities: rtpCapabilities 
      }
    });
  }

  private async handleCreateTransport(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId } = client;
    const { type } = message.data || {};
    if (!roomId || !type) return;

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const transportType = type as 'producer' | 'consumer';
    const result = await mediasoupService.createWebRtcTransport(roomId, client.id, transportType);
    if (!result) return;

    this.sendToClient(client, {
      type: 'transportCreated',
      data: {
        roomId,
        transportType,
        id: result.params.id,
        iceParameters: result.params.iceParameters,
        iceCandidates: result.params.iceCandidates,
        dtlsParameters: result.params.dtlsParameters
      }
    });
  }

  private async handleConnectTransport(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId } = client;
    const { transportId, dtlsParameters } = message.data || {};
    if (!roomId || !transportId || !dtlsParameters) return;

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const success = await mediasoupService.connectTransport(roomId, transportId, dtlsParameters);
    
    this.sendToClient(client, {
      type: 'transportConnected',
      data: {
        roomId,
        transportId,
        success
      }
    });
  }

  private async handleProduce(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId } = client;
    const { transportId, kind, rtpParameters, producerId } = message.data || {};
    if (!roomId || !transportId || !kind || !rtpParameters) return;

    // 确保客户端是生产者
    if (!client.isProducer) {
      return this.sendToClient(client, {
        type: 'error',
        data: { message: '非生产者客户端不能生产媒体流' }
      });
    }

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const result = await mediasoupService.produce(
      roomId,
      transportId,
      rtpParameters,
      kind,
      producerId
    );

    if (!result) return;

    this.sendToClient(client, {
      type: 'produceSuccess',
      data: {
        roomId,
        transportId,
        id: result.id
      }
    });

    // 通知房间内所有消费者有新的生产者
    this.broadcastToRoom(roomId, {
      type: 'producerInfo',
      data: {
        roomId,
        producerId: result.id,
        producerClientId: client.id,
        producerUserId: client.userId,
        kind
      }
    }, [client.id]); // 不通知生产者自己
  }

  private async handleConsume(client: Client, message: SignalingMessage): Promise<void> {
    const { roomId } = client;
    const { transportId, producerId, rtpCapabilities } = message.data || {};
    if (!roomId || !transportId || !producerId || !rtpCapabilities) return;

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const result = await mediasoupService.consume(
      roomId,
      transportId,
      producerId,
      rtpCapabilities
    );

    if (!result) return;

    this.sendToClient(client, {
      type: 'consumeSuccess',
      data: {
        roomId,
        transportId,
        id: result.id,
        producerId: result.producerId,
        kind: result.kind,
        rtpParameters: result.rtpParameters
      }
    });
  }

  private handleResumeConsumer(client: Client, message: SignalingMessage): void {
    const { roomId } = client;
    const { consumerId } = message.data || {};
    if (!roomId || !consumerId) return;

    const mediasoupService = getMediasoupService();
    if (!mediasoupService) return;

    const success = mediasoupService.resumeConsumer(roomId, consumerId);

    this.sendToClient(client, {
      type: 'consumerResumed',
      data: {
        roomId,
        consumerId,
        success
      }
    });
  }

  private sendToClient(client: Client, message: SignalingMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(roomId: string, message: SignalingMessage, excludeClientIds: string[] = []): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.clients.forEach(client => {
      if (!excludeClientIds.includes(client.id)) {
        this.sendToClient(client, message);
      }
    });
  }
}

// 创建并导出信令服务实例
let signalingService: SignalingService | null = null;

export const initializeSignalingService = (server: HttpServer): SignalingService => {
  if (!signalingService) {
    signalingService = new SignalingService(server);
  }
  return signalingService;
};

export const getSignalingService = (): SignalingService | null => {
  return signalingService;
}; 
