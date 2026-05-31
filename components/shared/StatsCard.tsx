'use client';

import { cn, formatRupiah } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
  isCurrency?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  isCurrency = false,
}: StatsCardProps) {
  const displayValue = isCurrency
    ? formatRupiah(typeof value === 'string' ? parseInt(value) : value)
    : typeof value === 'number'
      ? value.toLocaleString('id-ID')
      : value;

  return (
    <Card className={cn('stats-card overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{displayValue}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{trend.positive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
