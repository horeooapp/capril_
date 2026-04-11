"use client"

import React from "react"
import { Trophy, TrendingUp, Medal, Target } from "lucide-react"

export default function ChampionDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} /> Top Performers
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le classement Gamifié de vos agents commerciaux et gestionnaires.
                    </p>
                </div>
            </div>

            <div className="pt-8">
                 {/* Top 1 Podium */}
                 <div className="bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)] rounded-[2.5rem] p-8 text-white relative shadow-2xl flex flex-col items-center text-center max-w-lg mx-auto mb-10 transform hover:-translate-y-2 transition-transform">
                     <div className="absolute -top-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500 font-black text-xl shadow-lg border-4 border-yellow-400">1</div>
                     <Medal size={48} className="text-yellow-200 mb-4" />
                     <h2 className="text-3xl font-black mb-1">Cédric K.</h2>
                     <p className="text-[10px] font-black uppercase tracking-widest text-yellow-100 mb-6">Master Gestionnaire</p>
                     
                     <div className="flex gap-6">
                         <div className="text-center">
                             <p className="text-[10px] uppercase font-black text-yellow-200">Mandats</p>
                             <p className="text-2xl font-black">24</p>
                         </div>
                         <div className="w-px bg-yellow-400/50"></div>
                         <div className="text-center">
                             <p className="text-[10px] uppercase font-black text-yellow-200">Recouvrement</p>
                             <p className="text-2xl font-black">98%</p>
                         </div>
                     </div>
                 </div>

                 {/* Runner Ups */}
                 <div className="space-y-4">
                      <div className="bg-white border border-qgrey-2 rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:border-blue-400 transition-all">
                          <div className="w-8 h-8 rounded-full bg-qgrey-1 flex items-center justify-center text-qnavy font-black">2</div>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black">AF</div>
                          <div className="flex-1">
                              <h4 className="font-black text-qnavy-dark">Aminata F.</h4>
                              <p className="text-[10px] uppercase tracking-widest text-qtext-light">Commerciale</p>
                          </div>
                          <div className="text-right">
                              <p className="font-black text-qblue text-xl">18</p>
                              <p className="text-[10px] uppercase tracking-widest text-qtext-light">Nouveaux Baux</p>
                          </div>
                      </div>
                      
                      <div className="bg-white border border-qgrey-2 rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:border-orange-400 transition-all">
                          <div className="w-8 h-8 rounded-full bg-qgrey-1 flex items-center justify-center text-qorange/50 font-black">3</div>
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black">JB</div>
                          <div className="flex-1">
                              <h4 className="font-black text-qnavy-dark">Jean-Baptiste</h4>
                              <p className="text-[10px] uppercase tracking-widest text-qtext-light">Agent Maintenance</p>
                          </div>
                          <div className="text-right">
                              <p className="font-black text-qorange text-xl">42</p>
                              <p className="text-[10px] uppercase tracking-widest text-qtext-light">Tickets Résolus</p>
                          </div>
                      </div>
                 </div>
            </div>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-qtext-light mt-8">Gamification powered by QAPRIL Engine</p>
        </div>
    )
}
