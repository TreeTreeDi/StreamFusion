'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const streamTypes = ['游戏', '音乐', '户外', '生活'];

export default function StartStreamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>(streamTypes[0]);
  const [roomName, setRoomName] = useState('');
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  // 滚动时自动选中中心项
  useEffect(() => {
    if (currentStep !== 1) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      let minDist = Infinity;
      let selected = streamTypes[0];
      const items = Array.from(container.querySelectorAll('li[data-type]'));
      items.forEach((li, idx) => {
        const liRect = li.getBoundingClientRect();
        const liCenter = liRect.top + liRect.height / 2;
        const dist = Math.abs(centerY - liCenter);
        if (dist < minDist) {
          minDist = dist;
          selected = streamTypes[idx];
        }
      });
      setSelectedType(selected);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // 初始触发一次
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep === 1 && selectedType) {
      setCurrentStep(2);
    } else if (currentStep === 1 && !selectedType) {
      // Optionally handle the case where no type is selected yet
      // Maybe auto-select the middle one or show a message
      console.warn("Please select a stream type.");
    }
  };

  const handleStartStreaming = () => {
    if (roomName.trim() === '') {
      // Optionally show an error message
      console.error("Room name cannot be empty.");
      return;
    }
    // Navigate to dashboard with room name
    router.push(`/dashboard?roomName=${encodeURIComponent(roomName.trim())}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Left Panel: Question/Prompt */}
      <div className="w-full md:w-1/3 bg-gradient-to-tr from-pink-400 via-purple-500 to-blue-500 dark:bg-gray-800 p-8 flex flex-col justify-center items-center shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {currentStep === 1 ? '选择你的直播类型' : '给你的直播间起个名字'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          {currentStep === 1
            ? '滚动选择一个最适合你直播内容的类型。'
            : '输入一个响亮的名字，吸引更多观众！'}
        </p>
      </div>

      {/* Right Panel: Interaction */}
      <div className="w-full md:w-2/3 flex flex-col justify-center items-center p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              className="w-full max-w-xs h-64 overflow-hidden relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              {/* TODO: Implement scrollable list with scroll-snap */}
              <ul
              ref={scrollContainerRef}
              className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
              onScroll={() => {}} // 触发 useEffect 内监听
            >
              {/* Add padding items for centering */}
              <li className="h-1/2 snap-start"></li>
              {streamTypes.map((type) => (
                <motion.li
                  key={type}
                  data-type={type}
                  className="h-16 flex items-center justify-center text-xl font-semibold cursor-pointer snap-center"
                  onClick={() => setSelectedType(type)}
                  animate={{
                    opacity: selectedType === type ? 1 : 0.5,
                    scale: selectedType === type ? 1.1 : 1,
                    color: selectedType === type
                      ? (document.documentElement.classList.contains('dark') ? '#F472B6' : '#8B5CF6') // Direct color based on dark mode
                      : (document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563'),
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {type}
                  {selectedType === type && (
                     // Use motion.span for potential animation later
                    <motion.span
                      className="ml-2 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ color: 'inherit' }} // Inherit color from parent li
                    >
                      已选
                    </motion.span>
                  )}
                </motion.li>
              ))}
              {/* Add padding items for centering */}
              <li className="h-1/2 snap-end"></li>
            </ul>
             {/* TODO: Add visual indicator for the center item */}
             <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
                <div className="h-16 w-full border-y-2 border-purple-500 dark:border-pink-500 rounded"></div>
             </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              className="w-full max-w-md space-y-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
            <Label htmlFor="roomName" className="text-lg font-medium text-gray-700 dark:text-gray-300">直播间名称</Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="例如：我的精彩直播"
              className="text-lg"
              maxLength={50} // Example limit
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8">
          {currentStep === 1 && (
            <Button onClick={handleNextStep} size="lg" className="px-8 py-3">
              下一步
            </Button>
          )}
          {currentStep === 2 && (
             <div className="flex gap-4">
                 <Button variant="outline" onClick={() => setCurrentStep(1)} size="lg" className="px-8 py-3">
                    上一步
                 </Button>
                <Button onClick={handleStartStreaming} size="lg" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    开始直播
                </Button>
             </div>
          )}
        </div>
      </div>
      {/* Removed old global style block */}
    </div>
  );
}
