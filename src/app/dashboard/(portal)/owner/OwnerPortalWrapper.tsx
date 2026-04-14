'use client';

import React from 'react';

import { OwnerPortalDashboardV2 } from '@/components/dashboard/owner/OwnerPortalDashboardV2';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OwnerPortalWrapper({ 
  user,
  properties,
  diasporaData,
  intermData,
  activeRole,
  aggregates

}: { 
  user?: any,
  properties?: any[],
  diasporaData?: any, 
  intermData?: any, 
  activeRole?: string,
  aggregates?: any
}) {

  if (!user || !properties) return null;
  return (
    <OwnerPortalDashboardV2 
      user={user} 
      properties={properties} 
      activeRole={activeRole}
      aggregates={aggregates}
    />
  );
}
