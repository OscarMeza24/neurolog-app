'use client';

import { Card, CardContent } from '@/components/ui/card';
import { UsersIcon, BookOpenIcon, EditIcon, TrendingUpIcon } from 'lucide-react';
import { ChildWithRelation } from '@/types';

interface ChildrenStatsProps {
  children: ChildWithRelation[];
}

export function ChildrenStats({ children }: ChildrenStatsProps) {
  const stats = {
    total: children.length,
    active: children.filter(c => c.is_active).length,
    editable: children.filter(c => c.can_edit).length,
    withDiagnosis: children.filter(c => c.diagnosis).length,
  };

  const statsData = [
    {
      icon: UsersIcon,
      title: 'Total Niños',
      value: stats.total,
      color: 'text-blue-600',
    },
    {
      icon: BookOpenIcon,
      title: 'Activos',
      value: stats.active,
      color: 'text-green-600',
    },
    {
      icon: EditIcon,
      title: 'Editables',
      value: stats.editable,
      color: 'text-purple-600',
    },
    {
      icon: TrendingUpIcon,
      title: 'Con Diagnóstico',
      value: stats.withDiagnosis,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
