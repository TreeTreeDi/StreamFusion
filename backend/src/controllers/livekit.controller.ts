import { Context } from 'koa';
import { LiveKitService } from '../services/livekit.service';

export class LiveKitController {
  private livekitService: LiveKitService;

  constructor() {
    this.livekitService = LiveKitService.getInstance();
  }

  /**
   * 生成 LiveKit 访问令牌
   * 
   * POST /api/livekit/token
   * 
   * Body: { roomName: string, isPublisher: boolean }
   */
  public generateToken = async (ctx: Context) => {
    try {
      // 从请求体获取参数
      const { roomName, isPublisher = false } = ctx.request.body as { 
        roomName: string; 
        isPublisher?: boolean;
      };

      // 验证参数
      if (!roomName) {
        ctx.status = 400;
        ctx.body = { success: false, message: '缺少必要参数 roomName' };
        return;
      }

      // 从认证信息获取用户ID (假设已经通过认证中间件)
      const userId = ctx.state.user?.id || 'anonymous';

      // 生成令牌
      let token: string;
      if (isPublisher) {
        token = await this.livekitService.generateBroadcasterToken(userId, roomName);
      } else {
        token = await this.livekitService.generateViewerToken(userId, roomName);
      }

      // 返回令牌
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          token,
          identity: userId,
          room: roomName
        }
      };
    } catch (error) {
      console.error('生成 LiveKit Token 失败:', error);
      ctx.status = 500;
      ctx.body = { 
        success: false, 
        message: '生成 Token 失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
} 
