// src/components/ui/metric-card.tsx

'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'purple' | 'green' | 'orange' | 'gray';
  subtitle?: string;
}

export function MetricCard({ 
  title, 
  value, 
  suffix = '', 
  icon: Icon, 
  color,
  subtitle 
}: MetricCardProps) {
  return (
    <Card className={cn('bg-white dark:bg-gray-800')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center rounded-md bg-secondary p-2">
          <Icon className={cn(
            'h-4 w-4',
            {
              'text-blue-500': color === 'blue',
              'text-red-500': color === 'red',
              'text-purple-500': color === 'purple',
              'text-green-500': color === 'green',
              'text-orange-500': color === 'orange',
              'text-gray-500': color === 'gray'
            }
          )} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}{suffix}</div>
      </CardContent>
    </Card>
  );
}
