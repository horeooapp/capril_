'use client';

import React from 'react';
import { useLandlordData } from '@/hooks/qapril-web-hooks';
import { OwnerPortalDashboard } from '@/components/dashboard/owner/OwnerPortalDashboard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OwnerPortalWrapper({ 
  user,
  properties,
  diasporaData, 
  intermData, 
  activeRole 
}: { 
  user?: any,
  properties?: any[],
  diasporaData?: any, 
  intermData?: any, 
  activeRole?: string 
}) {

  if (!user || !properties) return null;

  return (
    <OwnerPortalDashboard 
      user={user} 
      properties={properties} 
      diasporaData={diasporaData}
      intermData={intermData}
      activeRole={activeRole}
    />
  );
}
