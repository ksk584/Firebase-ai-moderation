
'use client';

import { useState, useEffect, useCallback } from 'react';

const BLOCKLIST_KEY = 'safesocial_blocklist';

export function useBlocklist() {
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(BLOCKLIST_KEY);
      if (item) {
        setBlocklist(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to load blocklist from localStorage', error);
      setBlocklist([]);
    }
    setIsLoaded(true);
  }, []);

  const addBlock = useCallback((userId: string) => {
    if (blocklist.includes(userId)) return;
    const newBlocklist = [...blocklist, userId];
    setBlocklist(newBlocklist);
     try {
      window.localStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newBlocklist));
    } catch (error) {
      console.error('Failed to save blocklist to localStorage', error);
    }
  }, [blocklist]);

  const removeBlock = useCallback((userId: string) => {
    const newBlocklist = blocklist.filter(id => id !== userId);
    setBlocklist(newBlocklist);
     try {
      window.localStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newBlocklist));
    } catch (error) {
      console.error('Failed to save blocklist to localStorage', error);
    }
  }, [blocklist]);

  return { blocklist, addBlock, removeBlock, isLoaded };
}
