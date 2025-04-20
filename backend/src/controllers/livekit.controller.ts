import { randomBytes } from 'crypto'; // 导入 crypto
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

      // --- 修改开始 ---
      let identity: string;
      const authenticatedUserId = ctx.state.user?.id; // 获取认证用户ID

      if (isPublisher) {
        // 主播必须是认证用户
        if (!authenticatedUserId) {
          ctx.status = 403; // Forbidden or 401 Unauthorized
          ctx.body = { success: false, message: '只有认证用户才能成为主播' };
          return;
        }
        identity = authenticatedUserId;
      } else {
        // 观众可以是认证用户或匿名访客
        if (authenticatedUserId) {
          identity = authenticatedUserId;
        } else {
          // 生成匿名访客ID
          identity = `Guest-${randomBytes(4).toString('hex')}`;
        }
      }
      // --- 修改结束 ---


      // 使用确定的 identity 生成令牌
      let token: string;
      if (isPublisher) {
        // 传递 identity 给 service 方法 (假设 service 方法接受 identity)
        token = await this.livekitService.generateBroadcasterToken(identity, roomName);
      } else {
        token = await this.livekitService.generateViewerToken(identity, roomName);
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          token,
          identity: identity, // 返回最终确定的 identity
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
