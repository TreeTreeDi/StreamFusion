import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">LiveKit 直播测试</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>主播模式</CardTitle>
            <CardDescription>
              以主播身份开始直播，您需要允许浏览器访问摄像头和麦克风
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>在主播模式下，您可以：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>开启或关闭摄像头</li>
              <li>开启或关闭麦克风</li>
              <li>分享屏幕</li>
              <li>查看观众数量</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/test/broadcast">
                进入主播模式
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>观众模式</CardTitle>
            <CardDescription>
              以观众身份观看直播
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>在观众模式下，您可以：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>观看主播的直播画面</li>
              <li>听取主播的声音</li>
              <li>查看其他观众</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/test/viewer">
                进入观众模式
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">测试说明</h2>
        <p className="mt-2 text-amber-700 dark:text-amber-300">
          要进行测试，请先在一个浏览器窗口中打开主播模式，然后在另一个浏览器窗口（或隐私模式/其他设备）中打开观众模式。
          确保您已登录系统，否则无法获取直播令牌。
        </p>
      </div>
    </div>
  );
} 
