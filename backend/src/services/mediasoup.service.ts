import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport, Producer, Consumer, RtpCapabilities, Transport } from 'mediasoup/node/lib/types';
import { getSignalingService } from './signaling.service';
import os from 'os';

export interface MediaRoom {
  id: string;
  router: Router;
  transports: Map<string, WebRtcTransport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
}

export class MediasoupService {
  private worker: Worker | null = null;
  private rooms: Map<string, MediaRoom> = new Map();
  private workerSettings: mediasoup.types.WorkerSettings = {
    logLevel: 'warn',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp'
    ],
    rtcMinPort: 10000,
    rtcMaxPort: 10100
  };
  
  private routerOptions: mediasoup.types.RouterOptions = {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '4d0032',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000
        }
      }
    ]
  };

  private webRtcTransportOptions: mediasoup.types.WebRtcTransportOptions = {
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: this.getLocalIp() // 本地开发使用，生产环境应该使用公网IP
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
    maxSctpMessageSize: 262144
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.worker = await mediasoup.createWorker(this.workerSettings);
      
      console.log('Mediasoup worker created');
      
      this.worker.on('died', () => {
        console.error('Mediasoup worker died, exiting in 2 seconds...');
        setTimeout(() => process.exit(1), 2000);
      });

      this.setupSignalingHandlers();
    } catch (error) {
      console.error('Mediasoup worker creation failed:', error);
      throw error;
    }
  }

  private setupSignalingHandlers(): void {
    const signalingService = getSignalingService();
    if (!signalingService) {
      console.error('Signaling service not initialized');
      return;
    }

    // 在这里可以添加对信令消息的处理
    // 这个部分将在后续实现
  }

  private getLocalIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        // 跳过内部和非IPv4地址
        if (iface.family !== 'IPv4' || iface.internal) {
          continue;
        }
        // 返回第一个找到的非内部IPv4地址
        return iface.address;
      }
    }
    // 如果找不到，默认使用本地回环地址
    return '127.0.0.1';
  }

  public async createRouter(roomId: string): Promise<Router | null> {
    if (!this.worker) {
      console.error('Mediasoup worker not initialized');
      return null;
    }

    try {
      // 如果房间已存在，直接返回其路由器
      if (this.rooms.has(roomId)) {
        return this.rooms.get(roomId)!.router;
      }

      // 创建新的路由器
      const router = await this.worker.createRouter(this.routerOptions);
      
      // 创建新房间
      const room: MediaRoom = {
        id: roomId,
        router,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map()
      };
      
      this.rooms.set(roomId, room);
      
      console.log(`Room ${roomId} created with router ID: ${router.id}`);
      
      return router;
    } catch (error) {
      console.error(`Error creating router for room ${roomId}:`, error);
      return null;
    }
  }

  public async createWebRtcTransport(
    roomId: string,
    clientId: string,
    type: 'producer' | 'consumer'
  ): Promise<{
    transport: WebRtcTransport;
    params: {
      id: string;
      iceParameters: any;
      iceCandidates: any;
      dtlsParameters: any;
    };
  } | null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return null;
    }

    try {
      // 创建传输对象
      const transport = await room.router.createWebRtcTransport(
        this.webRtcTransportOptions
      );

      // 保存传输对象
      const transportId = `${type}_${clientId}`;
      room.transports.set(transportId, transport);

      // 监听传输关闭事件
      transport.on('routerclose', () => {
        console.log(`Transport ${transport.id} closed because router closed`);
        room.transports.delete(transportId);
      });

      // 监听传输关闭事件
      transport.on('@close', () => {
        console.log(`Transport ${transport.id} closed`);
        room.transports.delete(transportId);
      });

      // 返回传输参数
      const params = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      };

      return { transport, params };
    } catch (error) {
      console.error(`Error creating WebRTC transport for room ${roomId}:`, error);
      return null;
    }
  }

  public async connectTransport(
    roomId: string,
    transportId: string,
    dtlsParameters: any
  ): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      console.error(`Transport ${transportId} not found`);
      return false;
    }

    try {
      await transport.connect({ dtlsParameters });
      console.log(`Transport ${transportId} connected`);
      return true;
    } catch (error) {
      console.error(`Error connecting transport ${transportId}:`, error);
      return false;
    }
  }

  public async produce(
    roomId: string,
    transportId: string,
    rtpParameters: any,
    kind: mediasoup.types.MediaKind,
    producerId?: string
  ): Promise<{ id: string; producersExist: boolean } | null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return null;
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      console.error(`Transport ${transportId} not found`);
      return null;
    }

    try {
      // 创建生产者
      const producer = await transport.produce({
        kind,
        rtpParameters,
        id: producerId // 可选，如果前端提供了特定ID
      });

      // 保存生产者
      room.producers.set(producer.id, producer);

      // 监听生产者关闭事件
      producer.on('transportclose', () => {
        console.log(`Producer ${producer.id} closed because transport closed`);
        room.producers.delete(producer.id);
      });

      console.log(`Producer ${producer.id} created in room ${roomId}`);

      // 返回生产者ID和房间中是否已有其他生产者
      return {
        id: producer.id,
        producersExist: room.producers.size > 1
      };
    } catch (error) {
      console.error(`Error creating producer in room ${roomId}:`, error);
      return null;
    }
  }

  public async consume(
    roomId: string,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ): Promise<{
    id: string;
    producerId: string;
    kind: mediasoup.types.MediaKind;
    rtpParameters: any;
  } | null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return null;
    }

    const transport = room.transports.get(consumerTransportId);
    if (!transport) {
      console.error(`Transport ${consumerTransportId} not found`);
      return null;
    }

    const producer = room.producers.get(producerId);
    if (!producer) {
      console.error(`Producer ${producerId} not found`);
      return null;
    }

    // 检查是否可以使用这些RTP能力进行消费
    if (!room.router.canConsume({
      producerId: producer.id,
      rtpCapabilities
    })) {
      console.error(`Cannot consume producer ${producerId} with given RTP capabilities`);
      return null;
    }

    try {
      // 创建消费者
      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: true // 启动时暂停，等待客户端准备好
      });

      // 保存消费者
      room.consumers.set(consumer.id, consumer);

      // 监听消费者关闭事件
      consumer.on('transportclose', () => {
        console.log(`Consumer ${consumer.id} closed because transport closed`);
        room.consumers.delete(consumer.id);
      });

      consumer.on('producerclose', () => {
        console.log(`Consumer ${consumer.id} closed because producer closed`);
        room.consumers.delete(consumer.id);
      });

      console.log(`Consumer ${consumer.id} created for producer ${producerId} in room ${roomId}`);

      return {
        id: consumer.id,
        producerId: producer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      };
    } catch (error) {
      console.error(`Error creating consumer for producer ${producerId}:`, error);
      return null;
    }
  }

  public resumeConsumer(roomId: string, consumerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }

    const consumer = room.consumers.get(consumerId);
    if (!consumer) {
      console.error(`Consumer ${consumerId} not found`);
      return false;
    }

    try {
      consumer.resume();
      console.log(`Consumer ${consumerId} resumed`);
      return true;
    } catch (error) {
      console.error(`Error resuming consumer ${consumerId}:`, error);
      return false;
    }
  }

  public getRouterRtpCapabilities(roomId: string): RtpCapabilities | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return null;
    }

    return room.router.rtpCapabilities;
  }

  public closeProducer(roomId: string, producerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }

    const producer = room.producers.get(producerId);
    if (!producer) {
      console.error(`Producer ${producerId} not found`);
      return false;
    }

    try {
      producer.close();
      room.producers.delete(producerId);
      console.log(`Producer ${producerId} closed`);
      return true;
    } catch (error) {
      console.error(`Error closing producer ${producerId}:`, error);
      return false;
    }
  }

  public closeTransport(roomId: string, transportId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      console.error(`Transport ${transportId} not found`);
      return false;
    }

    try {
      transport.close();
      room.transports.delete(transportId);
      console.log(`Transport ${transportId} closed`);
      return true;
    } catch (error) {
      console.error(`Error closing transport ${transportId}:`, error);
      return false;
    }
  }

  public closeRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return false;
    }

    try {
      // 关闭所有传输，这将自动关闭相关的生产者和消费者
      for (const transport of room.transports.values()) {
        transport.close();
      }

      // 关闭路由器
      room.router.close();
      
      // 从房间列表中移除
      this.rooms.delete(roomId);
      
      console.log(`Room ${roomId} closed`);
      
      return true;
    } catch (error) {
      console.error(`Error closing room ${roomId}:`, error);
      return false;
    }
  }

  public getProducerIds(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return [];
    }

    return Array.from(room.producers.keys());
  }
}

// 创建并导出mediasoup服务实例
let mediasoupService: MediasoupService | null = null;

export const initializeMediasoupService = async (): Promise<MediasoupService> => {
  if (!mediasoupService) {
    mediasoupService = new MediasoupService();
  }
  return mediasoupService;
};

export const getMediasoupService = (): MediasoupService | null => {
  return mediasoupService;
}; 
