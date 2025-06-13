'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ViewModeToggleProps {
  initialMode: 'grid' | 'list';
  onModeChange: (mode: 'grid' | 'list') => void;
}

export function ViewModeToggle({ initialMode, onModeChange }: ViewModeToggleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialMode);

  const handleGridClick = () => {
    setViewMode('grid');
    onModeChange('grid');
  };

  const handleListClick = () => {
    setViewMode('list');
    onModeChange('list');
  };

  return (
    <div className="flex justify-end">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Vista:</span>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={handleGridClick}
        >
          Tarjetas
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={handleListClick}
        >
          Lista
        </Button>
      </div>
    </div>
  );
}
