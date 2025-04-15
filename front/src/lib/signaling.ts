import { EventEmitter } from 'events';

// 信令消息类型
export interface SignalingMessage {
  type: string;
  roomId?: string;
  targetId?: string;
  data?: any;
}

// 响应类型
interface ResponseData {
  [key: string]: any;
}

export class SignalingService extends EventEmitter {
  private socket: WebSocket | null = null;
  private clientId: string | null = null;
  private isConnected = false;
  private messageQueue: SignalingMessage[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

  constructor(private serverUrl: string = '') {
    super();
    // 如果没有提供服务器URL，则根据当前环境构建URL
    if (!serverUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = process.env.NEXT_PUBLIC_API_URL || window.location.host;
      this.serverUrl = `${protocol}://${host}`;
    }
  }

  // 连接到信令服务器
  public connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket && this.clientId) {
        resolve(this.clientId);
        return;
      }

      try {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
          console.log('信令服务器连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // 发送排队的消息
          this.messageQueue.forEach(message => {
            this.send(message);
          });
          this.messageQueue = [];
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);

            // 如果收到连接确认消息，则解析Promise
            if (message.type === 'connected' && message.data?.clientId) {
              this.clientId = message.data.clientId;
              resolve(this.clientId);
            }
          } catch (error) {
            console.error('解析消息失败:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket错误:', error);
          this.emit('error', error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket连接已关闭');
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('连接到信令服务器失败:', error);
        reject(error);
      }
    });
  }

  // 加入房间
  public joinRoom(roomId: string, userId?: string, isProducer: boolean = false): void {
    this.send({
      type: 'joinRoom',
      data: {
        roomId,
        userId,
        isProducer
      }
    });
  }

  // 离开房间
  public leaveRoom(): void {
    this.send({
      type: 'leaveRoom'
    });
  }

  // 获取Router RTP能力
  public getRouterRtpCapabilities(): void {
    this.send({
      type: 'getRouterRtpCapabilities'
    });
  }

  // 创建传输
  public createTransport(type: 'producer' | 'consumer'): void {
    this.send({
      type: 'createTransport',
      data: { type }
    });
  }

  // 连接传输
  public connectTransport(transportId: string, dtlsParameters: any): void {
    this.send({
      type: 'connectTransport',
      data: {
        transportId,
        dtlsParameters
      }
    });
  }

  // 开始生产媒体流
  public produce(transportId: string, kind: string, rtpParameters: any, producerId?: string): void {
    this.send({
      type: 'produce',
      data: {
        transportId,
        kind,
        rtpParameters,
        producerId
      }
    });
  }

  // 开始消费媒体流
  public consume(transportId: string, producerId: string, rtpCapabilities: any): void {
    this.send({
      type: 'consume',
      data: {
        transportId,
        producerId,
        rtpCapabilities
      }
    });
  }

  // 恢复消费者
  public resumeConsumer(consumerId: string): void {
    this.send({
      type: 'resumeConsumer',
      data: {
        consumerId
      }
    });
  }

  // 断开连接
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.clientId = null;
      
      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
        this.reconnectTimeoutId = null;
      }
    }
  }

  // 发送消息
  private send(message: SignalingMessage): void {
    if (!this.isConnected || !this.socket) {
      console.log('未连接到信令服务器，消息已加入队列', message);
      this.messageQueue.push(message);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('发送消息失败:', error);
      this.messageQueue.push(message);
    }
  }

  // 处理接收到的消息
  private handleMessage(message: SignalingMessage): void {
    // 转发消息给监听器
    this.emit(message.type, message.data);
    // 同时触发一个通用的消息事件
    this.emit('message', message);
  }

  // 尝试重新连接
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`已达到最大重连尝试次数(${this.maxReconnectAttempts})，不再尝试重连`);
      this.emit('reconnectFailed');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`将在 ${delay}ms 后尝试重新连接，尝试次数: ${this.reconnectAttempts + 1}`);

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`正在尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(error => {
        console.error('重新连接失败:', error);
      });
    }, delay);
  }
}

// 创建单例实例
let signalingService: SignalingService | null = null;

export const getSignalingService = (): SignalingService => {
  if (!signalingService) {
    signalingService = new SignalingService();
  }
  return signalingService;
}; 
