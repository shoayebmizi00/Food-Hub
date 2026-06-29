// Skeleton card component placeholder.
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function FoodCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}