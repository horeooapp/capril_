"use client"

import React from 'react'
import { 
  MessageCircle, 
  ShieldAlert, 
  CreditCard, 
  ClipboardCheck, 
  Clock,
  User,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export type TimelineEvent = {
  type: 'MESSAGE' | 'SYSTEM' | 'PAYMENT' | 'EDL';
  date: Date;
  title: string;
  content?: string;
  sender?: string;
  meta?: any;
};

interface MediationTimelineProps {
  events: TimelineEvent[];
}

const iconMap = {
  MESSAGE: <MessageCircle className="w-4 h-4" />,
  SYSTEM: <ShieldAlert className="w-4 h-4" />,
  PAYMENT: <CreditCard className="w-4 h-4" />,
  EDL: <ClipboardCheck className="w-4 h-4" />,
}

const colorMap = {
  MESSAGE: 'bg-blue-100 text-blue-600 border-blue-200',
  SYSTEM: 'bg-amber-100 text-amber-600 border-amber-200',
  PAYMENT: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  EDL: 'bg-purple-100 text-purple-600 border-purple-200',
}

export const MediationTimeline: React.FC<MediationTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed rounded-xl">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p>Aucun événement enregistré dans la chronologie.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
      {events.map((event, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative flex items-start group"
        >
          {/* Icon node */}
          <div className={`absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all group-hover:scale-110 ${colorMap[event.type]}`}>
            {iconMap[event.type]}
          </div>

          <div className="flex-1 ml-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {event.title}
              </h4>
              <time className="text-xs font-medium text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(event.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </time>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-all">
              {event.content && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {event.content}
                </p>
              )}

              {event.type === 'MESSAGE' && event.meta?.attachments?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.meta.attachments.map((url: string, aIdx: number) => (
                    <a 
                      key={aIdx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-[10px] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1 transition-colors"
                    >
                      <FileText className="w-3 h-3 mr-1 text-gray-400" />
                      Pièce jointe #{aIdx + 1}
                    </a>
                  ))}
                </div>
              )}

              {event.sender && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-gray-400">
                    <User className="w-3 h-3 mr-1" />
                    {event.sender}
                  </div>
                  {event.meta?.role && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      {event.meta.role}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
