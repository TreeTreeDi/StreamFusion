"use client"; // Required for Framer Motion components

import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';

// 引入 Font Awesome 图标 (假设已在项目中配置)
// import '@fortawesome/fontawesome-free/css/all.min.css';

// ECharts is now imported

const LandingPage: React.FC = () => {
  const router = useRouter();
  // Animation variants for fade-in-up effect
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
  };

  // Viewport settings for scroll trigger
  const viewport = { once: true, amount: 0.2 }; // Trigger when 20% is visible, only once

  // ECharts options for Latency Comparison
  const latencyChartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(30, 30, 42, 0.9)', // Dark tooltip background
      borderColor: '#5751D5',
      textStyle: {
        color: '#efeff1' // Light text color
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['StreamFusion', 'Traditional CDN', 'Other WebRTC'],
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#4a4a5e' // Dark axis line
          }
        },
        axisLabel: {
          color: '#a0a0b8' // Light axis labels
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Latency (ms)',
        nameTextStyle: {
          color: '#a0a0b8'
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4a4a5e'
          }
        },
        axisLabel: {
          color: '#a0a0b8'
        },
        splitLine: {
          lineStyle: {
            color: '#2a2a3e' // Darker split lines
          }
        }
      }
    ],
    series: [
      {
        name: 'Average Latency',
        type: 'bar',
        barWidth: '60%',
        data: [150, 2500, 500], // Example data (lower is better)
        itemStyle: {
          color: '#5751D5', // Use primary color
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#7a74e0' // Lighter purple on hover
          }
        }
      }
    ],
    backgroundColor: 'transparent' // Make chart background transparent
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0e10] to-[#1a1a2e] text-[#efeff1] overflow-x-hidden"> {/* Added overflow-x-hidden */}
      {/* --- Aurora Background Start --- */}
      {/* TODO: Implement Aurora background effect using CSS/JS */}
      <div className="aurora-bg absolute inset-0 z-0 opacity-30 pointer-events-none">
        {/* Example structure for aurora - needs actual implementation */}
        <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] bg-purple-600 rounded-full filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-[40%] h-[40%] bg-pink-500 rounded-full filter blur-[120px] opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-blue-400 rounded-full filter blur-[80px] opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
      {/* --- Aurora Background End --- */}

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24 sm:space-y-32">

        {/* 1. Hero Section */}
        {/* No scroll animation needed for the initial Hero section, it should be visible on load */}
        <section className="text-center">
          {/* Gradient text already applied via Tailwind */}
          {/* Apply initial animation directly for load-in effect */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-[#5751D5] to-pink-500"
          >
            StreamFusion: 实时互动直播新纪元
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl lg:text-2xl font-bold mb-8 text-gray-300"
          >
            StreamFusion: The New Era of Real-time Interactive Live Streaming
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10"
          >
            基于 WebRTC 构建，为您带来前所未有的超低延迟、高并发、强互动直播体验。
            <br />
            Built on WebRTC, delivering unprecedented ultra-low latency, high concurrency, and interactive live streaming experiences.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => router.push('/login')} // Redirect to registration page
            className="bg-[#5751D5] hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
          >
            立即体验 / Get Started
          </motion.button>
          {/* 可选: 简介视频/动画区域 */}
          {/* <div className="mt-12 aspect-video max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl"> Video Placeholder </div> */}
        </section>

        {/* 2. 核心功能 */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ duration: 0.6, staggerChildren: 0.1 }} // Add stagger for children
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">核心功能</h2>
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-400 mb-12 sm:mb-16">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 功能卡片 1 - Apply variants to individual cards */}
            <motion.div
              variants={fadeInUp} // Inherit parent's variants or define specific ones
              className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 transition duration-300 hover:border-purple-400 hover:shadow-purple-500/30 transform hover:-translate-y-1"
            >
              <i className="fas fa-bolt text-3xl text-[#5751D5] mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">超低延迟</h4>
              <h5 className="text-lg font-medium text-gray-300 mb-3">Ultra-Low Latency</h5>
              <p className="text-gray-400 text-sm">毫秒级延迟，实现音视频实时同步互动。</p>
              <p className="text-gray-500 text-xs">Millisecond-level latency for real-time audio/video synchronization.</p>
            </motion.div>
            {/* 功能卡片 2 */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 transition duration-300 hover:border-purple-400 hover:shadow-purple-500/30 transform hover:-translate-y-1"
            >
              <i className="fas fa-users text-3xl text-[#5751D5] mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">多人互动连麦</h4>
              <h5 className="text-lg font-medium text-gray-300 mb-3">Multi-Party Interaction</h5>
              <p className="text-gray-400 text-sm">支持多人同时在线连麦，互动形式多样。</p>
              <p className="text-gray-500 text-xs">Supports multi-user co-streaming with diverse interaction formats.</p>
            </motion.div>
            {/* 功能卡片 3 */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 transition duration-300 hover:border-purple-400 hover:shadow-purple-500/30 transform hover:-translate-y-1"
            >
              <i className="fas fa-globe-americas text-3xl text-[#5751D5] mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">全球节点覆盖</h4>
              <h5 className="text-lg font-medium text-gray-300 mb-3">Global Node Coverage</h5>
              <p className="text-gray-400 text-sm">全球分布式节点，保证各地流畅访问。</p>
              <p className="text-gray-500 text-xs">Globally distributed nodes ensure smooth access worldwide.</p>
            </motion.div>
            {/* 功能卡片 4 */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 transition duration-300 hover:border-purple-400 hover:shadow-purple-500/30 transform hover:-translate-y-1"
            >
              <i className="fas fa-video text-3xl text-[#5751D5] mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">高清画质</h4>
              <h5 className="text-lg font-medium text-gray-300 mb-3">High-Definition Quality</h5>
              <p className="text-gray-400 text-sm">支持多种分辨率，提供清晰流畅视觉体验。</p>
              <p className="text-gray-500 text-xs">Supports multiple resolutions for a clear and smooth visual experience.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. 技术亮点 */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">技术亮点</h2>
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-400 mb-12 sm:mb-16">Technology Highlights</h3>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h4 className="text-2xl font-semibold mb-4">基于 WebRTC 的现代架构</h4>
              <h5 className="text-xl font-medium text-gray-300 mb-6">Modern Architecture based on WebRTC</h5>
              <p className="text-gray-400 mb-4">
                利用 WebRTC 的点对点和 SFU 架构优势，结合优化的信令与媒体服务器，实现高效、低成本的实时通信。
              </p>
              <p className="text-gray-500 mb-4">
                Leveraging the advantages of WebRTC's P2P and SFU architectures, combined with optimized signaling and media servers, to achieve efficient and cost-effective real-time communication.
              </p>
              <p className="text-gray-400">
                我们对网络传输进行了深度优化，即使在弱网环境下也能保证相对稳定的直播质量。
              </p>
               <p className="text-gray-500">
                We have deeply optimized network transmission to ensure relatively stable streaming quality even under poor network conditions.
              </p>
            </div>
            <div className="lg:w-1/2 w-full h-64 sm:h-80 bg-gray-800/50 rounded-lg shadow-xl border border-white/20 overflow-hidden p-4">
              <ReactECharts
                option={latencyChartOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
                theme={"dark"} // Optional: Use built-in dark theme or customize
              />
            </div>
          </div>
        </motion.section>

        {/* 4. 快速上手 */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">快速上手</h2>
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-400 mb-12 sm:mb-16">Quick Start Guide</h3>
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12">
            {/* 步骤 1 */}
            <motion.div
              variants={fadeInUp}
              className="flex items-start gap-4 md:flex-col md:items-center md:text-center max-w-xs mx-auto"
            >
              <div className="flex-shrink-0">
                <span className="text-5xl font-extrabold text-[#5751D5]">1</span>
                <i className="fas fa-user-plus text-3xl text-purple-400 ml-2 md:ml-0 md:mt-2"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1 mt-2 md:mt-4">注册账户</h4>
                <h5 className="text-lg font-medium text-gray-300 mb-2">Register Account</h5>
                <p className="text-gray-400 text-sm">简单几步，快速创建您的 StreamFusion 账户。</p>
                <p className="text-gray-500 text-xs">Create your StreamFusion account in just a few simple steps.</p>
              </div>
            </motion.div>
             {/* 步骤 2 */}
             <motion.div
              variants={fadeInUp}
              className="flex items-start gap-4 md:flex-col md:items-center md:text-center max-w-xs mx-auto"
             >
              <div className="flex-shrink-0">
                <span className="text-5xl font-extrabold text-[#5751D5]">2</span>
                <i className="fas fa-cogs text-3xl text-purple-400 ml-2 md:ml-0 md:mt-2"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1 mt-2 md:mt-4">配置直播间</h4>
                <h5 className="text-lg font-medium text-gray-300 mb-2">Configure Stream</h5>
                <p className="text-gray-400 text-sm">设置直播标题、封面、分类等信息。</p>
                <p className="text-gray-500 text-xs">Set up your stream title, cover image, category, etc.</p>
              </div>
            </motion.div>
             {/* 步骤 3 */}
             <motion.div
              variants={fadeInUp}
              className="flex items-start gap-4 md:flex-col md:items-center md:text-center max-w-xs mx-auto"
             >
              <div className="flex-shrink-0">
                <span className="text-5xl font-extrabold text-[#5751D5]">3</span>
                <i className="fas fa-broadcast-tower text-3xl text-purple-400 ml-2 md:ml-0 md:mt-2"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-1 mt-2 md:mt-4">开始推流</h4>
                <h5 className="text-lg font-medium text-gray-300 mb-2">Start Streaming</h5>
                <p className="text-gray-400 text-sm">使用 OBS 或其他工具，即可开始您的直播。</p>
                <p className="text-gray-500 text-xs">Use OBS or other tools to start your live stream.</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 5. 未来规划 */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">未来展望</h2>
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-400 mb-12 sm:mb-16">Future Roadmap</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* 规划项 1 */}
             <motion.div
              variants={fadeInUp}
              className="bg-gray-800/30 p-6 rounded-lg border border-gray-700"
             >
              <i className="fas fa-robot text-2xl text-purple-400 mb-3"></i>
              <h4 className="text-lg font-semibold mb-1">AI 智能剪辑</h4>
              <h5 className="text-base font-medium text-gray-400 mb-2">AI Smart Clipping</h5>
              <p className="text-gray-500 text-sm">自动生成直播精彩片段。</p>
              <p className="text-gray-600 text-xs">Automatically generate highlight clips from live streams.</p>
            </motion.div>
             {/* 规划项 2 */}
             <motion.div
              variants={fadeInUp}
              className="bg-gray-800/30 p-6 rounded-lg border border-gray-700"
             >
              <i className="fas fa-vr-cardboard text-2xl text-purple-400 mb-3"></i>
              <h4 className="text-lg font-semibold mb-1">VR 直播支持</h4>
              <h5 className="text-base font-medium text-gray-400 mb-2">VR Streaming Support</h5>
              <p className="text-gray-500 text-sm">探索沉浸式直播体验。</p>
              <p className="text-gray-600 text-xs">Explore immersive live streaming experiences.</p>
            </motion.div>
             {/* 规划项 3 */}
             <motion.div
              variants={fadeInUp}
              className="bg-gray-800/30 p-6 rounded-lg border border-gray-700"
             >
              <i className="fas fa-puzzle-piece text-2xl text-purple-400 mb-3"></i>
              <h4 className="text-lg font-semibold mb-1">更丰富的互动插件</h4>
              <h5 className="text-base font-medium text-gray-400 mb-2">Richer Interactive Plugins</h5>
              <p className="text-gray-500 text-sm">增加投票、问答、抽奖等互动玩法。</p>
              <p className="text-gray-600 text-xs">Add interactive features like polls, Q&A, lotteries, etc.</p>
            </motion.div>
          </div>
        </motion.section>

      </main>

      {/* 6. 页脚 */}
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={viewport}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-[#0e0e10] border-t border-gray-800 pt-12 pb-8"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">准备好开启您的直播之旅了吗？</h2>
          <h3 
          className="text-lg text-gray-400 mb-8">Ready to start your streaming journey?</h3>
          <button 
            onClick={() => router.push('/login')} // Redirect to registration page

          className="bg-[#5751D5] hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 mb-12">
            立即注册 / Sign Up Now
          </button>
          <div className="flex justify-center space-x-6 mb-8">
            {/* TODO: 添加实际链接 */}
            <a href="#" className="hover:text-purple-400 transition duration-300">服务条款 / Terms</a>
            <a href="#" className="hover:text-purple-400 transition duration-300">隐私政策 / Privacy</a>
            <a href="#" className="hover:text-purple-400 transition duration-300">联系我们 / Contact</a>
          </div>
          <div className="flex justify-center space-x-6 mb-8">
            {/* TODO: 添加社交媒体图标和链接 */}
            <a href="#" aria-label="Twitter" className="hover:text-purple-400 transition duration-300"><i className="fab fa-twitter text-xl"></i></a>
            <a href="#" aria-label="GitHub" className="hover:text-purple-400 transition duration-300"><i className="fab fa-github text-xl"></i></a>
            <a href="#" aria-label="Discord" className="hover:text-purple-400 transition duration-300"><i className="fab fa-discord text-xl"></i></a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} StreamFusion. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
