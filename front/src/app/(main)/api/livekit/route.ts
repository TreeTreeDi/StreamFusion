// front/src/app/api/livekit/rooms/route.ts
import { RoomServiceClient, Room } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

// 从环境变量获取 LiveKit 服务器信息和凭证 (使用 .env.local 中定义的名称)
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET;

// 从 WebSocket URL 推导 Host URL
let livekitHost: string | undefined;
if (wsUrl) {
  try {
    const url = new URL(wsUrl);
    url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:'; // 转换为 https 或 http
    livekitHost = url.origin; // 获取 origin (e.g., https://your-livekit-instance.com)
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_LIVEKIT_WS_URL:", e);
  }
}


if (!livekitHost || !apiKey || !apiSecret) {
  console.error("LiveKit server environment variables (derived LIVEKIT_HOST from NEXT_PUBLIC_LIVEKIT_WS_URL, NEXT_PUBLIC_LIVEKIT_API_KEY, NEXT_PUBLIC_LIVEKIT_API_SECRET) are not set correctly.");
  console.log("Derived LIVEKIT_HOST:", livekitHost);
  console.log("NEXT_PUBLIC_LIVEKIT_API_KEY:", apiKey ? '***' : apiKey);
  console.log("NEXT_PUBLIC_LIVEKIT_API_SECRET:", apiSecret ? '***' : apiSecret);
  // 在生产环境中，不应直接暴露错误细节
  // throw new Error("LiveKit server configuration missing.");
}

// 创建 RoomServiceClient 实例
// 注意：只有在所有环境变量都存在时才创建客户端
const roomServiceClient = livekitHost && apiKey && apiSecret
  ? new RoomServiceClient(livekitHost, apiKey, apiSecret) // 使用正确的变量
  : null;

export async function GET(request: Request) {
  if (!roomServiceClient) {
    return NextResponse.json({ error: 'LiveKit server not configured' }, { status: 500 });
  }

  try {
    console.log("Fetching active rooms from LiveKit...");
    // 获取所有活跃的房间列表
    const rooms: Room[] = await roomServiceClient.listRooms();
    console.log(`Found ${rooms.length} active rooms.`);

    // 格式化房间信息，可以根据需要提取更多信息
    // 例如，如果主播在加入时设置了 metadata，可以在这里提取
    const formattedRooms = rooms.map(room => ({
      id: room.sid, // 使用 sid 作为唯一标识符可能更可靠
      name: room.name,
      participantCount: room.numParticipants,
      // 尝试从 metadata 获取主播信息（假设主播设置了 'isHost' 和 'hostName'）
      // 注意：这需要主播端在加入时正确设置 metadata
      // hostName: room.metadata ? JSON.parse(room.metadata).hostName : 'Unknown Host',
      // thumbnailUrl: `https://picsum.photos/seed/${room.name}/440/248` // 临时缩略图
      // 你可能需要一个更可靠的方式来获取或生成缩略图
    }));

     console.log("Formatted rooms:", formattedRooms);

    return NextResponse.json(formattedRooms);

  } catch (error) {
    console.error("Error fetching LiveKit rooms:", error);
    // 根据错误类型返回不同的状态码可能更好
    return NextResponse.json({ error: 'Failed to fetch live streams', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
