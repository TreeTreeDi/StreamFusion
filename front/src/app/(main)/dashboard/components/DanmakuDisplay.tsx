import React, { useEffect, useState, useRef } from 'react';
import { ChatMessage } from '../hooks/useChat'; // Assuming ChatMessage type is exported from useChat

interface DanmakuDisplayProps {
  messages: ChatMessage[];
  videoHeight?: number; // Optional: to constrain danmaku within video area
}

interface DanmakuItem extends ChatMessage {
  id: string; // Unique ID for key prop and animation management
  top: number;
  animationDuration: number;
}

const DanmakuDisplay: React.FC<DanmakuDisplayProps> = ({ messages, videoHeight = 480 }) => {
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const occupiedTracks = useRef<Set<number>>(new Set());
  const MAX_TRACKS = 10; // Adjust based on desired density and video height

  useEffect(() => {
    if (messages.length === 0) {
      // Clear danmaku if messages are cleared (e.g., on disconnect)
      // setDanmakuList([]); // Or let them fade out naturally
      return;
    }

    // 只处理新的数据
    const latestMessage = messages[messages.length - 1];
    // 观察到 interface 没有定义 timestamp 属性
    // 这里使用最新消息的时间戳
    // 作为唯一标识符
    const messageTimestamp = latestMessage.timestamp || Date.now();
    if (!latestMessage || danmakuList.some(d =>
        (d as any).timestamp === messageTimestamp && // Cast to any for initial check if properties might not exist on d
        d.identity === latestMessage.identity &&
        d.message === latestMessage.message
    )) {
      // Avoid adding duplicate messages
      return;
    }

    const newDanmakuId = `${messageTimestamp}-${latestMessage.identity}-${Math.random()}`;

    // 找到空的轨道
    let trackNumber = -1;
    const trackHeight = Math.max(20, videoHeight / MAX_TRACKS); // Min height 20px

    for (let i = 0; i < MAX_TRACKS; i++) {
      if (!occupiedTracks.current.has(i)) {
        trackNumber = i;
        break;
      }
    }

    // If all tracks are occupied, try to pick one randomly or the first one.
    // A more sophisticated system might queue messages or drop them.
    if (trackNumber === -1) {
      trackNumber = Math.floor(Math.random() * MAX_TRACKS);
    }

    occupiedTracks.current.add(trackNumber);
    const topPosition = trackNumber * trackHeight;

    // Randomize animation duration slightly for a more natural look
    const animationDuration = 8 + Math.random() * 4; // 8 to 12 seconds

    const newDanmaku: DanmakuItem = {
      ...latestMessage,
      id: newDanmakuId,
      top: topPosition,
      animationDuration: animationDuration,
    };

    setDanmakuList(prevList => [...prevList, newDanmaku]);

    // Free up the track after the danmaku has passed
    // This timeout should roughly match the animation duration
    setTimeout(() => {
      occupiedTracks.current.delete(trackNumber);
      setDanmakuList(prev => prev.filter(d => d.id !== newDanmakuId));
    }, animationDuration * 1000 + 500); // Add a small buffer

  }, [messages, videoHeight]); // Rerun when messages or videoHeight changes

  if (!containerRef.current && danmakuList.length > 0) {
    // This helps in getting container width for initial calculations if needed,
    // but for now, animation is purely CSS based on 100% width.
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-10"
      style={{ height: videoHeight ? `${videoHeight}px` : '100%' }}
    >
      {danmakuList.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-white text-lg font-bold"
          style={{
            top: `${item.top}px`,
            left: '100%', // Start off-screen to the right
            textShadow: '1px 1px 2px black, 0 0 1em black, 0 0 0.2em black',
            animation: `scrollLeft ${item.animationDuration}s linear forwards`,
            willChange: 'transform', // Optimize for animation
          }}
        >
          {/* 防止匿名用户使用 */}
          {item.identity && <span className="text-purple-400 mr-2">{item.identity}:</span>}
          {item.message}
        </div>
      ))}
      <style jsx global>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-${containerRef.current ? containerRef.current.offsetWidth + 300 : 1000}%); // Ensure it goes completely off-screen
          }
        }
      `}</style>
    </div>
  );
};

export default DanmakuDisplay;
