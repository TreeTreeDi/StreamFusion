import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

export class LiveKitService {
  private static instance: LiveKitService;
  private apiKey: string;
  private apiSecret: string;

  private constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('LiveKit API 凭据未配置。请在 .env 中设置 LIVEKIT_API_KEY 和 LIVEKIT_API_SECRET');
    }
  }

  public static getInstance(): LiveKitService {
    if (!LiveKitService.instance) {
      LiveKitService.instance = new LiveKitService();
    }
    return LiveKitService.instance;
  }

  /**
   * 刷新API凭据（用于测试）
   */
  public refreshCredentials(): void {
    this.apiKey = process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || '';
  }

  /**
   * 生成 LiveKit 访问令牌
   * @param identity 参与者标识（通常是用户ID）
   * @param roomName 房间名称
   * @param isPublisher 是否允许发布媒体流
   * @param ttl 令牌有效期（秒）
   */
  public async generateToken(
    identity: string,
    roomName: string, 
    isPublisher: boolean = false,
    ttl: number = 3600 // 默认1小时
  ): Promise<string> {
    try {
      // 确保使用最新的环境变量
      this.refreshCredentials();

      if (!this.apiKey || !this.apiSecret) {
        throw new Error('LiveKit API 凭据未配置');
      }

      console.log('生成令牌:', {
        apiKey: this.apiKey,
        apiSecret: '***', // 不打印实际密钥
        identity,
        roomName,
        isPublisher
      });

      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity,
        ttl
      });

      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: isPublisher,
        canPublishData: true,
        canSubscribe: true,
      });

      return at.toJwt();
    } catch (error) {
      console.error('生成 LiveKit 令牌失败:', error);
      throw error;
    }
  }

  /**
   * 生成主播的访问令牌
   */
  public async generateBroadcasterToken(userId: string, roomName: string): Promise<string> {
    return this.generateToken(userId, roomName, true);
  }

  /**
   * 生成观众的访问令牌
   */
  public async generateViewerToken(userId: string, roomName: string): Promise<string> {
    return this.generateToken(userId, roomName, false);
  }
} 
