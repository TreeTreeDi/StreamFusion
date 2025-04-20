  "use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Placeholder function for getting logged-in user (Consider moving to a shared util)
const getCurrentLoggedInUsername = (): string | null => {
  // Replace this with your actual logic to get the username
  // e.g., from context, local storage, or an API call
  console.warn("Using placeholder for getCurrentLoggedInUsername in useRoomInitialization");
  // Example: return localStorage.getItem('username');
  return "TestUser"; // Placeholder value for now
};

export function useRoomInitialization() {
  const searchParams = useSearchParams();
  const [initialRoomName, setInitialRoomName] = useState<string>('');
  const [initialRole, setInitialRole] = useState<'host' | 'viewer'>('viewer');
  const [isAutoJoining, setIsAutoJoining] = useState<boolean>(false);
  const [derivedUsername, setDerivedUsername] = useState<string>('');

  useEffect(() => {
    const roomNameParam = searchParams.get('roomName');
    const roleParam = searchParams.get('role');

    // Set username from logged-in status or placeholder
    const loggedInUsername = getCurrentLoggedInUsername();
    setDerivedUsername(loggedInUsername || 'Viewer'); // Use 'Viewer' if not logged in

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
  }, [searchParams]); // Re-run if searchParams change

  return { initialRoomName, initialRole, isAutoJoining, derivedUsername, setInitialRoomName, setInitialRole };
}
