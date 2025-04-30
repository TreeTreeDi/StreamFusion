  "use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

/**
 * 必须在组件或自定义hook顶层调用
 * 推荐：只在useRoomInitialization内部调用
 */
const getCurrentLoggedInUsername = (user: { username?: string } | null): string | null => {
  if (user && user.username) {
    return user.username;
  }
  return null;
};

export function useRoomInitialization() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [initialRoomName, setInitialRoomName] = useState<string>('');
  const [initialRole, setInitialRole] = useState<'host' | 'viewer'>('viewer');
  const [isAutoJoining, setIsAutoJoining] = useState<boolean>(false);
  const [derivedUsername, setDerivedUsername] = useState<string>('');

  useEffect(() => {
    const roomNameParam = searchParams.get('roomName');
    const roleParam = searchParams.get('role');

    // 使用安全的 getCurrentLoggedInUsername
    const loggedInUsername = getCurrentLoggedInUsername(user);
    setDerivedUsername(loggedInUsername || 'Viewer'); // 未登录用 'Viewer'

    if (roleParam === 'viewer' && roomNameParam) {
      console.log('Viewer detected via URL params, attempting auto-join...');
      setIsAutoJoining(true); // Mark as auto-joining
      setInitialRoomName(roomNameParam); // Set state for room name
      setInitialRole('viewer');       // Set state for role
      // Actual join call will be triggered by the main component's effect
    } else if (roleParam === 'host') {
        // If URL specifies host, pre-select role
        setInitialRole('host');
        if (roomNameParam) { // Also prefill room name if provided for host
            setInitialRoomName(roomNameParam);
        }
    }
    // If not auto-joining viewer, user might need to input room name (if host)
  }, [searchParams, user]); // user 变化时也更新

  return { initialRoomName, initialRole, isAutoJoining, derivedUsername, setInitialRoomName, setInitialRole };
}
