"use client"

import { useState, useEffect } from "react";
import { DiasporaDashboardData } from "@/types/diaspora";
import { generateDiasporaInvite, simulateSepaVirement } from "@/actions/diaspora-actions";
import { 
  BarChart3, 
  Building2, 
  Euro, 
  Handshake, 
  User, 
  Bell, 
  Settings, 
  Clock, 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  Plane,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Download,
  FileText,
  Mail,
  MessageSquare,
  ArrowLeft,
  Smartphone,
  Plus,
  X,
  Globe,
  Settings2,
  Lock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const T = {
  navy:"#0D2B6E",navyDark:"#071A45",navyLight:"#1A3D8C",navyPale:"#EEF2FA",
  green:"#1A7A3C",greenPale:"#E8F5EE",
  orange:"#C05B00",orangePale:"#FFF3E0",
  red:"#A00000",redPale:"#FEECEC",
  gold:"#C9A84C",goldPale:"#FDF6E3",
  teal:"#0E7490",tealPale:"#E0F4F9",
  purple:"#5B21B6",purplePale:"#EDE9FE",
  white:"#FFFFFF",bg:"transparent",
  grey1:"#EEF2F7",grey2:"#D6DCE8",grey3:"#8FA0BC",grey4:"#4A5B7A",
  text:"#0A1930",textMid:"#2D3F5E",textLight:"#6A7D9E",
  diaspora:"#0E3A8C",
};

const FCFA_EUR = 655.957;
const fmt  = (n: number) => n?.toLocaleString("fr-FR") ?? "0";
const fmtE = (n: number) => (n/FCFA_EUR).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0});
const FUSEAUX = ["Europe/Paris","Europe/London","America/Montreal","America/New_York","Africa/Abidjan"];

function useBreakpoint(){
  const [w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1440);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return{isMobile:w<768,isTablet:w>=768&&w<1100,isDesktop:w>=1100,w};
}

// ── COMPOSANTS ──
const Badge=({label,color,bg,size=11}: any)=>(
  <span style={{display:"inline-flex",alignItems:"center",background:bg,color,borderRadius:6,padding:"3px 9px",fontSize:size,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);
const Tag=({label,color}: any)=>(
  <span style={{display:"inline-flex",alignItems:"center",background:color+"15",color,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>{label}</span>
);
const RowData=({label,value,color,sub}: any)=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 0",borderBottom:`1px solid ${T.grey1}`}}>
    <span style={{fontSize:11,color:T.textLight,flexShrink:0,marginRight:12,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{label}</span>
    <div style={{textAlign:"right"}}>
      <div style={{fontSize:12,fontWeight:800,color:color||T.textMid}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:T.textLight,marginTop:1}}>{sub}</div>}
    </div>
  </div>
);

const SecTitle = ({ label, right }: { label: string, right?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6 px-2">
    <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{label}</div>
    {right}
  </div>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`glass-card-premium p-8 rounded-[2.5rem] border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ label, right }: any) => (
  <div className="flex justify-between items-center mb-6">
    <div className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{label}</div>
    {right}
  </div>
);
const BtnPrim=({label,onClick,small,color,bg,icon}: any)=>(
  <button onClick={onClick} style={{background:bg||color||T.navy,border:"none",borderRadius:10,padding:small?"6px 14px":"9px 18px",fontSize:small?11:12,fontWeight:700,color:bg?color:T.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,whiteSpace:"nowrap",transition:"transform 0.1s"}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
    {icon} {label}
  </button>
);
const BtnSec=({label,onClick,small,color}: any)=>(
  <button onClick={onClick} style={{background:"none",border:`1.5px solid ${color||T.navy}`,borderRadius:10,padding:small?"6px 14px":"9px 18px",fontSize:small?11:12,fontWeight:700,color:color||T.navy,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.1s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${color||T.navy}10`}} onMouseLeave={e=>{e.currentTarget.style.background="none"}}>
    {label}
  </button>
);

function Modal({open,onClose,title,tc,children,maxW=600}: any){
  if(!open)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(7,26,69,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:24,backdropFilter:"blur(4px)"}}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,width:"100%",maxWidth:maxW,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 100px rgba(7,26,69,.28)"}}>
        <div style={{padding:"22px 28px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.grey1}`,position:"sticky",top:0,background:T.white,borderRadius:"20px 20px 0 0",zIndex:1}}>
          <span style={{fontSize:17,fontWeight:800,color:tc||T.navy,textTransform:"uppercase",letterSpacing:1}}>{title}</span>
          <button onClick={onClose} style={{background:T.grey1,border:"none",borderRadius:9,padding:"6px 14px",fontSize:12,fontWeight:700,color:T.textMid,cursor:"pointer"}}>✕ Fermer</button>
        </div>
        <div style={{padding:"24px 28px"}}>{children}</div>
      </motion.div>
    </div>
  );
}

const MobileDialog = ({open,onClose,title,tc,children}: any)=>{
  if(!open)return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(7,26,69,.76)",display:"flex",alignItems:"flex-end",zIndex:500,backdropFilter:"blur(4px)"}}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} style={{background:T.white,borderRadius:"22px 22px 0 0",width:"100%",maxHeight:"90vh",overflowY:"auto",paddingBottom:24}}>
        <div style={{padding:"16px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:800,color:tc||T.navy,textTransform:"uppercase",letterSpacing:1}}>{title}</span>
          <button onClick={onClose} style={{background:T.grey1,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>{children}</div>
      </motion.div>
    </div>
  );
};

const TABS=[
  {id:"dashboard",icon:<BarChart3 size={18}/>,label:"Tableau de bord"},
  {id:"biens",    icon:<Building2 size={18}/>,label:"Mes biens"},
  {id:"virements",icon:<Euro size={18}/>,label:"Virements"},
  {id:"mobilemoney",icon:<Smartphone size={18}/>,label:"Mobile Money"},
  {id:"delegation",icon:<Handshake size={18}/>,label:"Délégation"},
  {id:"parametres",icon:<Settings2 size={18}/>,label:"Paramètres"},
];

interface DiasporaDashboardProps {
  data: DiasporaDashboardData;
  user: any;
}

const Sidebar = ({bp, sideOpen, tab, goTab, data}: any)=>(
  <div className={`flex flex-col flex-shrink-0 transition-all duration-300 z-[300] border-r border-[#1a1a1a] shadow-2xl ${
    bp.isMobile ? (sideOpen ? "fixed left-0 w-[280px]" : "fixed -left-[300px] w-[280px]") : (bp.isDesktop ? "w-[260px]" : "w-[80px]")
  }`} style={{ background: "#0F172A", minHeight: "100vh" }}>
    <div className="fixed inset-0 bg-mesh-dark opacity-10 pointer-events-none -z-10"></div>
    <div className="p-10 border-b border-white/5 space-y-4">
      {bp.isDesktop || bp.isMobile ? (
        <div>
          <div className="text-3xl font-black text-white tracking-tighter italic">QAPRIL.</div>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-lg">
            <Plane size={14} className="animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase">DIASPORA</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center text-white"><Plane size={24} /></div>
      )}
    </div>
    <nav style={{flex:1,padding:"20px 0"}}>
      {TABS.map(t=>{
        const active=tab===t.id;
        return(
          <button key={t.id} onClick={()=>goTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:bp.isDesktop||bp.isMobile?14:0,
            justifyContent:bp.isDesktop||bp.isMobile?"flex-start":"center",
            width:"100%",padding:bp.isDesktop||bp.isMobile?"14px 24px":"18px",
            background:active?"rgba(255,255,255,.08)":"transparent",
            border:"none",borderLeft:active?`4px solid ${T.gold}`:"4px solid transparent",
            cursor:"pointer",transition:"all 0.2s"
          }}>
            <span style={{color:active?T.gold:T.white,opacity:active?1:0.5}}>{t.icon}</span>
            {(bp.isDesktop||bp.isMobile)&&<span style={{fontSize:13,fontWeight:800,color:active?T.white:T.white,opacity:active?1:0.5,textTransform:"uppercase",letterSpacing:1}}>{t.label}</span>}
          </button>
        );
      })}
    </nav>
    {(bp.isDesktop||bp.isMobile)&&(
      <div style={{padding:"24px",borderTop:`1px solid rgba(255,255,255,.05)`,background:"rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:10,color:T.white,opacity:.4,marginBottom:6,fontWeight:800,textTransform:"uppercase"}}>Heure de référence</div>
        <div style={{fontSize:13,fontWeight:700,color:T.white}}>
          {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",timeZone:data.settings?.fuseau || "Europe/Paris"})} — {data.settings?.fuseau?.split("/")[1] || "Paris"}
        </div>
        <div style={{fontSize:10,color:T.gold,opacity:.8,marginTop:4,fontWeight:700}}>
          Abidjan : {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Abidjan"})}
        </div>
      </div>
    )}
  </div>
);

const Topbar = ({selBien, setSelBien, bp, setSideOpen, tab, user, data, devise, setDevise, op, impayesN, alertesSLA}: any)=>(
  <div className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-100 shadow-sm">
    <div className="flex items-center gap-8">
      {selBien ? (
        <button onClick={()=>setSelBien(null)} className="h-12 px-6 bg-gray-50 border border-gray-100 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest text-[#0D2B6E] flex items-center gap-3 hover:bg-white transition-all">
          <ArrowLeft size={16}/> {bp.isDesktop && "Retour"}
        </button>
      ) : bp.isTablet && (
        <button onClick={()=>setSideOpen((s: any)=>!s)} className="h-12 w-12 bg-gray-50 border border-gray-100 rounded-[1.25rem] flex items-center justify-center text-[#0D2B6E]"><BarChart3 size={20}/></button>
      )}
      <div>
        <div className="flex items-center gap-4">
          <p className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
            {TABS.find(t=>t.id===tab)?.label}
          </p>
          {selBien && <span className="text-primary font-black text-sm uppercase tracking-widest leading-none border-l-2 border-primary pl-4">{selBien.name}</span>}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
          {user.fullName || user.name} • Diaspora Premium • {data.settings?.pays || "France"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="bg-gray-50 p-1.5 rounded-[1.25rem] border border-gray-100 flex gap-2">
        {["FCFA","EUR"].map(d=>(
          <button key={d} onClick={()=>setDevise(d)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${d===devise ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-gray-600'}`}>
            {d==="EUR"?"€ EUR":"XOF"}
          </button>
        ))}
      </div>
      <button onClick={()=>op("notifs")} className="w-12 h-12 bg-white border border-gray-100 rounded-[1.25rem] flex items-center justify-center relative group hover:bg-gray-50 transition-all">
        <Bell size={20} className="text-gray-900 group-hover:rotate-12 transition-transform" />
        {(impayesN > 0 || alertesSLA > 0) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
      </button>
      <button onClick={()=>op("inviter")} className="h-12 px-8 bg-gray-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-gray-900/10">
        INVITER GESTIONNAIRE
      </button>
    </div>
  </div>
);

const Content = ({tab, bp, totalFCFA, affMontant, encFCFA, impayesN, alertesSLA, properties, op, goTab, selBien, setSelBien, data}: any)=>(
  <AnimatePresence mode="wait">
    {tab === "dashboard" && (
      <motion.div key="dash" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} style={{display:"flex",flexDirection:"column",gap:28}}>
        {/* KPI Row */}
        <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"repeat(4,1fr)":bp.isTablet?"1fr 1fr":"1fr",gap:20}}>
          <Card style={{display:"flex",alignItems:"center",gap:16,background:T.white}}>
            <div style={{width:48,height:48,borderRadius:12,background:T.navyPale,display:"flex",alignItems:"center",justifyContent:"center"}}><CreditCard color={T.navy} size={24}/></div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Revenus</div>
              <div style={{fontSize:18,fontWeight:900,color:T.navy}}>{affMontant(totalFCFA)}</div>
            </div>
          </Card>
          <Card style={{display:"flex",alignItems:"center",gap:16,background:T.white}}>
            <div style={{width:48,height:48,borderRadius:12,background:T.greenPale,display:"flex",alignItems:"center",justifyContent:"center"}}><CheckCircle2 color={T.green} size={24}/></div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Recouvré</div>
              <div style={{fontSize:18,fontWeight:900,color:T.green}}>{Math.round(encFCFA/totalFCFA*100)}%</div>
            </div>
          </Card>
          <Card style={{display:"flex",alignItems:"center",gap:16,background:T.white}}>
            <div style={{width:48,height:48,borderRadius:12,background:T.redPale,display:"flex",alignItems:"center",justifyContent:"center"}}><AlertTriangle color={T.red} size={24}/></div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Impayés</div>
              <div style={{fontSize:18,fontWeight:900,color:T.red}}>{impayesN}</div>
            </div>
          </Card>
          <Card style={{display:"flex",alignItems:"center",gap:16,background:T.white}}>
            <div style={{width:48,height:48,borderRadius:12,background:T.purplePale,display:"flex",alignItems:"center",justifyContent:"center"}}><Clock color={T.purple} size={24}/></div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Retards SLA</div>
              <div style={{fontSize:18,fontWeight:900,color:T.purple}}>{alertesSLA}</div>
            </div>
          </Card>
        </div>

        {/* Critical Alerts */}
        {impayesN > 0 && (
          <Card style={{borderLeft:`4px solid ${T.red}`}}>
            <CardTitle label="🚨 Alertes Critiques" right={<BtnSec label="Tout voir" small onClick={()=>op("notifs")}/>}/>
            {properties.filter((b: any)=>b.isImpaye).map((b: any)=>(
              <div key={b.id} style={{display:"flex",gap:12,alignItems:"flex-start",background:T.redPale,borderRadius:12,padding:14,marginBottom:8}}>
                <span style={{fontSize:18}}>🔴</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{b.name} — Impayé détecté</div>
                  <div style={{fontSize:11,color:T.textMid,marginTop:2}}>{b.locataire?.name || "Locataire inconnu"} · {affMontant(b.activeLease?.rentFcfa || 0)}</div>
                </div>
                <BtnPrim label="Agir" small onClick={()=>{setSelBien(b);goTab("biens");}} color={T.red}/>
              </div>
            ))}
          </Card>
        )}

        {/* Treasury Card */}
        <Card style={{background:`linear-gradient(135deg,${T.navy}05,${T.teal}05)`,border:`1px solid ${T.navy}10`,padding:"24px 28px"}}>
          <CardTitle label="💶 Analyse de Trésorerie"/>
          <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"1.5fr 1fr":"1fr",gap:24}}>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Performance annuelle</div>
              <div style={{fontSize:32,fontWeight:940,color:T.navy,marginBottom:8}}>{affMontant(totalFCFA * 12)}</div>
              <div style={{fontSize:11,color:T.textMid,fontWeight:700}}>{fmt(totalFCFA)} FCFA / mois · Taux 0% QAPRIL</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <BtnPrim label="Configurer virements SEPA" onClick={()=>goTab("virements")} icon={<Euro size={16}/>}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <button onClick={()=>op("virement")} style={{background:T.white,border:`1px solid ${T.grey2}`,borderRadius:12,padding:12,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}}>
                  <Download size={18} color={T.teal}/>
                  <span style={{fontSize:9,fontWeight:800,color:T.textMid,textTransform:"uppercase"}}>RIB</span>
                </button>
                <button onClick={()=>goTab("virements")} style={{background:T.white,border:`1px solid ${T.grey2}`,borderRadius:12,padding:12,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}}>
                  <FileText size={18} color={T.navy}/>
                  <span style={{fontSize:9,fontWeight:800,color:T.textMid,textTransform:"uppercase"}}>Historique</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Properties */}
        <div>
          <SecTitle label="🏠 Patrimoine Récent" right={<button onClick={()=>goTab("biens")} style={{background:"none",border:"none",fontSize:11,fontWeight:700,color:T.teal,cursor:"pointer"}}>Tout voir →</button>}/>
          <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"1fr 1fr":"1fr",gap:16}}>
            {properties.slice(0,2).map((b: any)=>(
              <Card key={b.id} style={{cursor:"pointer"}} onClick={()=>{setSelBien(b);goTab("biens");}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:T.grey1,display:"flex",alignItems:"center",justifyContent:"center"}}><Building2 size={20} color={T.navy}/></div>
                  <Badge label={b.managementMode === "AGENCY" ? "Agence" : "Direct"} color={T.teal} bg={T.tealPale}/>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:T.navy,marginBottom:4}}>{b.name}</div>
                <div style={{fontSize:11,color:T.textLight,marginBottom:16}}>{b.commune} · {b.propertyCode}</div>
                <RowData label="Revenu" value={affMontant(b.activeLease?.rentFcfa || 0)}/>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    )}

    {tab === "biens" && selBien && (
      <motion.div key="bien-detail" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} style={{display:"flex",flexDirection:"column",gap:24}}>
        <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"1.5fr 1fr":"1fr",gap:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            <Card>
              <CardTitle label="ℹ️ Fiche d'identité du bien" right={<Badge label={selBien.propertyCode} color={T.navy} bg={T.navyPale}/>}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
                <div style={{background:T.grey1,borderRadius:12,padding:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Commune</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.navy,marginTop:4}}>{selBien.commune}</div>
                </div>
                <div style={{background:T.grey1,borderRadius:12,padding:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Mode Gestion</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.teal,marginTop:4}}>{selBien.managementMode === "AGENCY" ? "Agence" : "Directe"}</div>
                </div>
              </div>
              <RowData label="Type de bien" value="Appartement F4" />
              <RowData label="Surface" value="120 m²" />
              <RowData label="Statut Occup." value={selBien.status === "OCCUPIED" ? "Occupé" : "Vacant"} color={selBien.status === "OCCUPIED" ? T.green : T.orange} />
            </Card>

            <Card>
              <CardTitle label="👤 Locataire Actuel" right={<BtnSec label="Détails" small />}/>
              <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:20}}>
                <div style={{width:56,height:56,borderRadius:28,background:T.navy,color:T.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900}}>{(selBien.activeLease?.tenant || "L").charAt(0)}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:900,color:T.navy}}>{selBien.activeLease?.tenant || "M. Kouassi Jean"}</div>
                  <div style={{fontSize:12,color:T.textLight}}>Bail signé le 12/01/2026</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <BtnSec label="Appeler" icon={<Smartphone size={14}/>} style={{width:"100%"}}/>
                <BtnSec label="Message" icon={<Mail size={14}/>} style={{width:"100%"}}/>
              </div>
            </Card>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            <Card style={{background:T.navy,color:T.white}}>
              <CardTitle label="💰 Revenus Mensuels" />
              <div style={{fontSize:32,fontWeight:940,marginBottom:8}}>{affMontant(selBien.activeLease?.rentFcfa || 0)}</div>
              <div style={{fontSize:12,opacity:0.7,marginBottom:20}}>{Math.round((selBien.activeLease?.rentFcfa || 0) / FCFA_EUR)} € / mois</div>
              <div style={{background: "rgba(255,255,255,0.1)", borderRadius:12, padding:12, display:"flex", justifyContent:"space-between"}}>
                 <span style={{fontSize:11,fontWeight:700}}>Dernier paiement</span>
                 <span style={{fontSize:11,fontWeight:900,color:T.gold}}>05 Mars 2026</span>
              </div>
            </Card>
            <Card>
              <CardTitle label="📑 Documents" />
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {["Contrat de Bail","EDL Entrée","Dernière Quittance"].map(d=>(
                  <div key={d} style={{padding:"12px 14px",background:T.grey1,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.textMid}}>{d}</span>
                    <Download size={16} color={T.grey3}/>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    )}

    {tab === "mobilemoney" && (
      <motion.div key="mm" initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",flexDirection:"column",gap:28}}>
        <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"1fr 1fr":"1fr",gap:20}}>
          {data.mobileMoney?.map((m: any,i: number)=>(
             <Card key={i} style={{background: m.provider === "Orange" ? "#FF7900" : "#FFCC00", color: m.provider === "Orange" ? T.white : "#000"}}>
               <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
                 <div>
                   <div style={{fontSize:12,fontWeight:700,opacity:0.8,textTransform:"uppercase"}}>{m.provider} Money</div>
                   <div style={{fontSize:24,fontWeight:900,marginTop:4}}>{m.phone}</div>
                 </div>
                 <div style={{width:48,height:48,background:"rgba(255,255,255,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}><Smartphone size={24}/></div>
               </div>
               <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                 <div>
                   <div style={{fontSize:10,fontWeight:700,opacity:0.6}}>Solde Actuel</div>
                   <div style={{fontSize:18,fontWeight:900}}>{affMontant(m.solde)}</div>
                 </div>
                 <Badge label="Connecté" color={T.white} bg="rgba(0,0,0,0.2)"/>
               </div>
             </Card>
          ))}
        </div>

        <SecTitle label="🔗 Webhooks de recouvrement" right={<Badge label="LIVE" color={T.green} bg={T.greenPale}/>}/>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:20,background:T.navyPale,borderBottom:`1px solid ${T.grey2}`,fontSize:11,fontWeight:800,color:T.navy,textTransform:"uppercase"}}>Signaux Temps Réel</div>
          {data.webhooks?.map((w: any,i: number)=>(
            <div key={i} style={{padding:16,borderBottom:`1px solid ${T.grey1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:36,height:36,borderRadius:8,background:T.white,border:`1px solid ${T.grey2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📡</div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:T.navy}}>{w.op} — {w.emetteur}</div>
                  <div style={{fontSize:10,color:T.textLight}}>{w.date} · {w.bien}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:900,color:T.navy}}>{affMontant(w.montant)}</div>
                <div style={{fontSize:9,fontWeight:800,color:T.green}}>DÉTECTÉ</div>
              </div>
            </div>
          ))}
        </Card>
      </motion.div>
    )}

    {tab === "delegation" && (
      <motion.div key="delegation" initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",flexDirection:"column",gap:28}}>
         <div style={{display:"grid",gridTemplateColumns:bp.isDesktop?"2fr 1.2fr":"1fr",gap:24}}>
           <div style={{display:"flex",flexDirection:"column",gap:24}}>
             <Card>
               <CardTitle label="📢 Gestionnaires Délégués" right={<BtnPrim label="Nouveau" small onClick={()=>op("inviter")} icon={<Plus size={14}/>}/>}/>
               {data.mandats?.map((m: any,i: number)=>(
                  <div key={i} style={{padding:16,background:T.grey1,borderRadius:12,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:40,height:40,borderRadius:10,background:T.white,display:"flex",alignItems:"center",justifyContent:"center"}}><Handshake color={T.navy} size={20}/></div>
                      <div>
                        <div style={{fontSize:14,fontWeight:800,color:T.navy}}>{m.agence || m.nom}</div>
                        <div style={{fontSize:11,color:T.textLight}}>{m.scope || "Tous les biens"} · {m.role}</div>
                      </div>
                    </div>
                    <Badge label={m.status} color={m.status === "Actif" ? T.green : T.orange} bg={m.status === "Actif" ? T.greenPale : T.orangePale}/>
                  </div>
               ))}
             </Card>
           </div>
           <div style={{display:"flex",flexDirection:"column",gap:24}}>
             <Card style={{background:T.teal,color:T.white}}>
               <CardTitle label="⚡ Configuration SLA" />
               <div style={{fontSize:11,opacity:0.8,marginBottom:20,lineHeight:1.4}}>Délai maximum autorisé pour la signalisation d'un incident majeur.</div>
               <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                 {["12h","24h","48h","72h"].map(h=>(
                   <button key={h} style={{padding:"12px",borderRadius:10,background:h==="24h"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.05)",border:"none",color:T.white,fontSize:13,fontWeight:900,cursor:"pointer"}}>{h}</button>
                 ))}
               </div>
               <div style={{marginTop:20,fontSize:10,fontWeight:700,textAlign:"center",opacity:0.6}}>Paramètre actuel : 24h</div>
             </Card>
           </div>
         </div>
      </motion.div>
    )}

    {tab === "parametres" && (
      <motion.div key="params" initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",flexDirection:"column",gap:28}}>
        <div style={{maxWidth:600}}>
          <SecTitle label="⚙️ Préférences de compte" />
          <Card style={{display:"flex",flexDirection:"column",gap:16}}>
            <RowData label="Devise préférée" value={data.settings?.devise || "FCFA"} />
            <RowData label="Fuseau Horaire" value={data.settings?.fuseau || "Europe/Paris"} />
            <RowData label="Pays de résidence" value={data.settings?.pays || "France"} />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"}}>
              <span style={{fontSize:11,color:T.textLight,fontWeight:700,textTransform:"uppercase"}}>Notifications Mail</span>
              <div style={{width:40,height:20,background:T.green,borderRadius:10,position:"relative"}}><div style={{width:16,height:16,background:T.white,borderRadius:8,position:"absolute",right:2,top:2}}/></div>
            </div>
            <div style={{marginTop:20,display:"flex",gap:12}}>
              <BtnPrim label="Sauvegarder les réglages" style={{flex:1}}/>
              <BtnSec label="Déconnexion" color={T.red}/>
            </div>
          </Card>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function DiasporaDashboard({ data, user }: DiasporaDashboardProps) {
  const bp = useBreakpoint();
  const [tab,setTab]           = useState("dashboard");
  const [selBien,setSelBien]   = useState<any>(null);
  const [sideOpen,setSideOpen] = useState(false);
  const [devise, setDevise]    = useState(user.diasporaDevise || "FCFA");
  const [O,setO] = useState({
    notifs:false,inviter:false,sla:false,virement:false,
    addBien:false,deleguer:false,selBienId:null as string | null,
    mmConfig:false,mmAjout:false,
  });
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  
  const handleGenerateInvite = async () => {
    setLoading(true);
    const res = await generateDiasporaInvite(user.id);
    if (res.success) setInviteUrl(res.inviteUrl || "");
    setLoading(false);
  };

  const handleExecuteVirement = async (amount: number) => {
    setLoading(true);
    const res = await simulateSepaVirement(amount, devise);
    if (res.success) {
        setMsg(res.message || "Succès");
        setTimeout(() => setMsg(null), 5000);
    }
    setLoading(false);
    cl("virement");
  };

  const op = (k: string,extra={})=>setO(o=>({...o,[k]:true,...extra}));
  const cl = (k: string)=>setO(o=>({...o,[k]:false,selBienId:null}));
  const goTab = (t: string)=>{setTab(t);setSelBien(null);setSideOpen(false);};

  const properties = data.properties || [];
  const mandats = data.mandats || [];
  const totalFCFA  = properties.filter((b: any) => b.activeLease).reduce((s: number, b: any) => s + b.activeLease.rentFcfa, 0);
  const encFCFA    = totalFCFA * 0.85; // Simulated
  const alertesSLA = properties.filter((b: any) => b.isHorsSLA).length;
  const impayesN = properties.filter((b: any) => b.isImpaye).length;

  const affMontant = (fcfa: number) => devise === "EUR" ? `${fmtE(fcfa)} €` : `${fmt(fcfa)} FCFA`;
  const fmtDual = (fcfa: number) => `${fmt(fcfa)} FCFA  ≈  ${fmtE(fcfa)} €`;

  const DialogComp = bp.isMobile ? MobileDialog : Modal;

  return (
    <>
      <div className="flex min-h-screen relative overflow-hidden font-sans text-gray-900">
      {/* Mesh Background (Admin Style) */}
      <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
      <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse-slow"></div>

      <Sidebar bp={bp} sideOpen={sideOpen} tab={tab} goTab={goTab} data={data} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar selBien={selBien} setSelBien={setSelBien} bp={bp} setSideOpen={setSideOpen} tab={tab} user={user} data={data} devise={devise} setDevise={setDevise} op={op} impayesN={impayesN} alertesSLA={alertesSLA} />
        
        <main className="flex-1 p-8 sm:p-12 overflow-y-auto">
          <Content tab={tab} bp={bp} totalFCFA={totalFCFA} affMontant={affMontant} encFCFA={encFCFA} impayesN={impayesN} alertesSLA={alertesSLA} 
                   properties={properties} op={op} goTab={goTab} selBien={selBien} setSelBien={setSelBien} data={data} />
        </main>
      </div>

      {bp.isMobile && (
        <div className="h-20 bg-gray-900/90 backdrop-blur-xl fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 z-[400] px-4">
          {TABS.slice(0,4).map(t=>(
            <button key={t.id} onClick={()=>goTab(t.id)} className={`flex flex-col items-center gap-1.5 transition-all ${tab===t.id ? 'text-primary' : 'text-white/40'}`}>
              <div className={`p-2 rounded-xl ${tab===t.id ? 'bg-primary/10' : ''}`}>{t.icon}</div>
              <span className="text-[8px] font-black uppercase tracking-widest">{t.label.split(" ")[0]}</span>
            </button>
          ))}
          <button onClick={()=>setSideOpen(true)} className="flex flex-col items-center gap-1.5 text-white/40">
            <div className="p-2 grow flex items-center justify-center"><Settings2 size={18}/></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Plus</span>
          </button>
        </div>
      )}
      </div>

      {/* ── OVERLAYS ── */}
      <DialogComp open={O.notifs} onClose={()=>cl("notifs")} title="Journaux de Bord" tc={T.navy}>
        <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:12}}>
          {data.webhooks?.map((w: any,i: number)=>(
            <div key={i} style={{padding:16,background:T.grey1,borderRadius:12,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:10,background:T.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔔</div>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:T.navy}}>{w.op} : Recouvrement {w.montant.toLocaleString()} FCFA</div>
                <div style={{fontSize:10,color:T.textLight}}>{w.date} · {w.emetteur} · {w.bien}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogComp>
      
      <DialogComp open={O.inviter} onClose={()=>cl("inviter")} title="Inviter un gestionnaire" tc={T.teal}>
        <div style={{paddingTop:12}}>
          <div style={{padding:16,background:T.tealPale,borderRadius:12,fontSize:11,fontWeight:600,color:T.teal,marginBottom:20,lineHeight:1.5}}>
            Générez un accès sécurisé pour votre partenaire local (Agence ou Proche). Il pourra éditer les quittances et signaler les incidents.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <RowData label="Bien concerné" value={selBien?.name || "Tous les biens"} />
            <div style={{fontSize:11,fontWeight:700,color:T.textLight,textTransform:"uppercase",marginBottom:8}}>Rôle du mandataire</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {["Agence Agréée","Particulier"].map(r=>(
                <button key={r} style={{padding:"12px",borderRadius:10,border:`1.5px solid ${T.grey2}`,background:T.white,fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>{r}</button>
              ))}
            </div>
          </div>
          <div style={{marginTop:24}}>
            {inviteUrl ? (
                <div style={{background:T.grey1, padding:16, borderRadius:12, marginBottom:16}}>
                    <div style={{fontSize:10, fontWeight:700, color:T.textLight, marginBottom:8}}>Lien généré :</div>
                    <div style={{fontSize:11, wordBreak:"break-all", color:T.navy, fontWeight:800}}>{inviteUrl}</div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(inviteUrl)}
                        style={{marginTop:12, width:"100%", padding:8, background:T.navy, color:"white", borderRadius:8, fontSize:10, fontWeight:700}}
                    >
                        Copier le lien
                    </button>
                </div>
            ) : (
                <BtnPrim 
                    label="Générer l'invitation" 
                    onClick={handleGenerateInvite} 
                    bg={T.teal} 
                    style={{width:"100%"}}
                    disabled={loading}
                />
            )}
          </div>
        </div>
      </DialogComp>

      {/* Virement Modal */}
      <DialogComp open={O.virement} onClose={()=>cl("virement")} title="Exécuter Virement SEPA" tc={T.navy}>
        <div style={{paddingTop:12}}>
            <RowData label="Montant disponible" value={affMontant(totalFCFA)} color={T.green} />
            <p style={{fontSize:11, color:T.textLight, marginTop:16, marginBottom:20}}>
                Le transfert sera exécuté via le réseau SEPA vers votre compte enregistré (Rule SEPA-01).
            </p>
            <BtnPrim 
                label={`Transférer ${affMontant(totalFCFA)}`} 
                onClick={() => handleExecuteVirement(totalFCFA)}
                style={{width:"100%"}}
                disabled={loading}
            />
        </div>
      </DialogComp>

      {msg && (
        <div className="fixed bottom-20 right-8 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[1000] text-[10px] font-black uppercase tracking-widest border border-white/10 animate-slide-up">
            {msg}
        </div>
      )}
    </>
  );
}
