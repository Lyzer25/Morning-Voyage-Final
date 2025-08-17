'use client';

import { useEffect, useState } from 'react';

interface LayoutDebuggerProps {
  showDebug?: boolean;
}

export function LayoutDebugger({ showDebug = false }: LayoutDebuggerProps) {
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateViewport = () => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      updateViewport();
      window.addEventListener('resize', updateViewport);
      return () => window.removeEventListener('resize', updateViewport);
    }
  }, []);

  if (!showDebug || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs font-mono shadow-lg">
      <div className="text-yellow-800 font-bold mb-2">Layout Debug Info</div>
      <div className="space-y-1">
        <div className="text-gray-700">
          <span className="text-blue-600">Header Z-Index:</span> 50 (z-50)
        </div>
        <div className="text-gray-700">
          <span className="text-green-600">Export Button Z-Index:</span> 60 (z-[60])
        </div>
        <div className="text-gray-700">
          <span className="text-purple-600">Modal Z-Index:</span> 100 (z-[100])
        </div>
        {viewport && (
          <div className="text-gray-700">
            <span className="text-orange-600">Viewport:</span> {viewport.width}x{viewport.height}
          </div>
        )}
        <div className="text-gray-700">
          <span className="text-red-600">Breakpoint:</span>{' '}
          {viewport && viewport.width >= 1024 ? 'lg+' :
           viewport && viewport.width >= 768 ? 'md' :
           viewport && viewport.width >= 640 ? 'sm' : 'xs'}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-yellow-200 text-xs text-gray-600">
        Development only - hidden in production
      </div>
    </div>
  );
}
