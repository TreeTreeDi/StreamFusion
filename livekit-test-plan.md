# LiveKit 流式页面重构方案

## 一、目标拆解
1. 抽象可复用组件  
   - **VideoArea**：本地与远端视频区域  
   - **ChatPanel**：消息列表与输入框  
2. 逻辑绑定  
   - 保留现有 Room / Track 事件与状态管理  
   - 新增 LiveKit DataTrack 创建、发布、接收  
3. 样式设计（暗黑模式优先）  
   - 深色背景与高亮按钮  
   - Tailwind CSS 主题扩展  
   - 可访问性：`aria-label`、键盘导航  

## 二、目录与文件
```
front/src/app/livekit-test/
├── components/
│   ├── VideoArea.tsx
│   └── ChatPanel.tsx
├── page.tsx
└── styles/
    └── livekit-test.css
```

## 三、组件设计

### 1. VideoArea.tsx
Props:
- `localRef: RefObject<HTMLVideoElement>`
- `isStreaming: boolean`
- `isCamEnabled: boolean`
- `participants: Map<string, RemoteParticipant>`
- `tracks: Map<string, RemoteTrack[]>`

职责：
- 渲染本地摄像头预览及占位  
- 多列/网格展示远端视频  

示例样式：
```tsx
<div className="bg-dark-surface p-2 rounded-lg">
  <h2 className="text-accent-purple mb-2">My Video</h2>
  <video ref={localRef} className="w-full aspect-video rounded" />
</div>
```

### 2. ChatPanel.tsx
Props:
- `room: Room`
- `identity: string`

State:
- `messages: Array<{ from: string; text: string; timestamp: Date }>`
- `input: string`

核心逻辑：
```ts
useEffect(() => {
  const dt = room.localParticipant.createDataTrack();
  room.localParticipant.publishDataTrack(dt);
  room.on(RoomEvent.DataReceived, (_src, payload) => {
    const msg = JSON.parse(payload.toString());
    setMessages(prev => [...prev, { ...msg, timestamp: new Date(msg.timestamp) }]);
  });
  return () => dt.stop();
}, [room]);

function sendMessage() {
  dt.send(JSON.stringify({ from: identity, text: input, timestamp: Date.now() }));
  setInput('');
}
```

示例样式：
```tsx
<div className="flex flex-col bg-dark-surface rounded-lg p-4 w-80 h-full">
  <ul className="flex-1 overflow-auto space-y-2 mb-2">
    {messages.map((m, i) => (
      <li key={i} className="text-sm">
        <span className="font-bold">{m.from}:</span> {m.text}
      </li>
    ))}
  </ul>
  <div className="flex">
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      className="flex-1 bg-dark-bg text-white p-2 rounded-l focus:outline-accent-purple"
    />
    <button
      onClick={sendMessage}
      className="bg-accent-purple text-white px-4 rounded-r hover:bg-purple-600"
    >
      发送
    </button>
  </div>
</div>
```

## 四、数据流与依赖
```mermaid
flowchart LR
  A[页面(page.tsx)] --> B[VideoArea]
  A --> C[ChatPanel]
  B -->|TrackEvents| LiveKitServer
  C -->|DataTrack| LiveKitServer
```

## 五、开发步骤
1. 创建 `components/` 与 `styles/` 目录  
2. 实现 `VideoArea.tsx`，提取 page.tsx 中视频相关 JSX  
3. 实现 `ChatPanel.tsx`，添加 DataTrack 逻辑与 UI  
4. 修改 `page.tsx`：引入组件并传递 props，清理内联样式  
5. 编写或扩展 `tailwind.config.js` 主题  
6. 验证可访问性：ARIA 与键盘操作  

## 六、暗黑主题配置（tailwind.config.js）
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0e0e10',
        'dark-surface': '#18181b',
        'dark-border': '#2a2a2d',
        'accent-purple': '#a970ff',
      },
    },
  },
};
