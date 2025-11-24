'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Newspaper } from 'lucide-react';

export function GazetteSection() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Newspaper className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Gazette Services</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Coming Soon!</span>
          </div>
          <p className="text-sm text-gray-500">
            Gazette publication and search services will be available soon.
            We're working hard to bring you the best experience.
          </p>
          <div className="text-xs text-gray-400">
            Stay tuned for updates!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}