# WebRTC 直播功能实现

本目录包含了实现WebRTC直播功能的核心服务，采用SFU (Selective Forwarding Unit) 架构。

## 架构概述

WebRTC直播功能由两个主要服务组成：

1. **信令服务 (signaling.service.ts)**：
   - 负责建立和维护WebSocket连接
   - 处理客户端加入/离开房间
   - 转发信令消息
   - 维护房间和客户端状态

2. **媒体服务 (mediasoup.service.ts)**：
   - 基于mediasoup库实现SFU功能
   - 负责媒体流的路由和转发
   - 创建和管理WebRTC传输、生产者和消费者
   - 处理媒体能力协商

## 信令流程

1. **连接建立**：
   - 客户端连接到WebSocket服务器
   - 接收唯一的客户端ID

2. **加入房间**：
   - 客户端发送`joinRoom`消息
   - 服务器创建或获取房间
   - 服务器为房间创建mediasoup Router

3. **媒体能力交换**：
   - 客户端请求Router的RTP能力 (`getRouterRtpCapabilities`)
   - 服务器返回Router能力，客户端用于创建Device

4. **传输创建（主播）**：
   - 主播请求创建发送传输 (`createTransport`, type: 'producer')
   - 服务器创建WebRtcTransport并返回参数
   - 主播连接传输 (`connectTransport`)
   - 主播开始生产媒体流 (`produce`)

5. **传输创建（观众）**：
   - 观众请求创建接收传输 (`createTransport`, type: 'consumer')
   - 服务器创建WebRtcTransport并返回参数
   - 观众连接传输 (`connectTransport`)
   - 观众请求消费特定生产者的媒体流 (`consume`)
   - 观众恢复消费者 (`resumeConsumer`)

6. **离开房间**：
   - 客户端发送`leaveRoom`消息或断开连接
   - 服务器清理相关资源并通知其他客户端

## 支持的消息类型

信令服务支持以下消息类型：

- `joinRoom`: 加入直播房间
- `leaveRoom`: 离开直播房间
- `getRouterRtpCapabilities`: 获取媒体能力
- `createTransport`: 创建WebRTC传输
- `connectTransport`: 连接WebRTC传输
- `produce`: 开始生产媒体流
- `consume`: 开始消费媒体流
- `resumeConsumer`: 恢复消费者
- `relaySdp`: 转发SDP（用于点对点连接）
- `relayIceCandidate`: 转发ICE候选者（用于点对点连接）

## 资源管理

1. **房间资源**：
   - 每个房间对应一个mediasoup Router
   - 房间内包含多个Transport、Producer和Consumer

2. **客户端资源**：
   - 每个客户端有唯一ID
   - 主播客户端创建Producer传输
   - 观众客户端创建Consumer传输

3. **资源清理**：
   - 客户端离开房间时释放相应传输
   - 房间为空时释放Router
   - Transport关闭时自动关闭相关Producer和Consumer

## 开发注意事项

1. **网络配置**：
   - 需要配置正确的listenIps和announcedIp
   - 生产环境应使用公网IP或配置TURN服务器

2. **性能考虑**：
   - mediasoup Worker负责媒体处理，占用CPU较高
   - 可配置多Worker实例提高性能
   - 高并发场景需考虑水平扩展

3. **媒体编解码配置**：
   - 默认支持VP8、VP9、H.264和Opus
   - 可根据兼容性和性能需求调整 
