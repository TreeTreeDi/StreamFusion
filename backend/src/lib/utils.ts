import crypto from 'crypto';

export const generateStreamKey = (): string => {
  // 生成一个足够长的随机字节串，并转换为 base64
  // base64 编码会增加长度约 1/3，32字节 -> ~43字符
  // 可以根据需要调整字节长度
  const key = crypto.randomBytes(32).toString('base64');
  // 移除 base64 中的特殊字符 (+, /) 并可能截断，确保兼容性
  // 或者直接使用 hex 编码，更简单且安全
  // return crypto.randomBytes(16).toString('hex'); // 示例：生成32个十六进制字符

  // 使用 URL 安全的 base64 变体，避免特殊字符问题
  return crypto.randomBytes(24).toString('base64url'); // 生成约32个字符的 URL 安全字符串
}; 
