"use client"

import { useState, useMemo } from "react";
import { useMobileMoneyLocataire } from "@/hooks/qapril-hooks";

// Theme Colors from Validated JSX
const T = {
  navy:"#0D2B6E",navyDark:"#071A45",navyPale:"#EEF2FA",
  green:"#1A7A3C",greenPale:"#E8F5EE",
  orange:"#C05B00",orangePale:"#FFF3E0",
  red:"#A00000",redPale:"#FEECEC",
  gold:"#C9A84C",goldPale:"#FDF6E3",
  teal:"#0E7490",tealPale:"#E0F4F9",
  purple:"#5B21B6",purplePale:"#EDE9FE",
  white:"#FFFFFF",bg:"#F2F5FA",
  grey1:"#EEF2F7",grey2:"#D6DCE8",grey3:"#8FA0BC",grey4:"#4A5B7A",
  text:"#0A1930",textMid:"#2D3F5E",textLight:"#6A7D9E",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

const Badge = ({label,color,bg,size=10}: {label:any, color:string, bg:string, size?:number}) => (
  <span style={{display:"inline-flex",alignItems:"center",background:bg,color,borderRadius:6,padding:"2px 7px",fontSize:size,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);

const Row = ({label,value,color}: {label:string, value:any, color?:string}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.grey1}`}}>
    <span style={{fontSize:10,color:T.textLight}}>{label}</span>
    <span style={{fontSize:11,fontWeight:700,color:color||T.textMid}}>{value}</span>
  </div>
);

const SecTitle = ({label,right}: {label:string, right?:any}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
    <div style={{fontSize:10,fontWeight:800,color:T.textLight,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
    {right}
  </div>
);

const ACard = ({icon,label,sub,color,bg,onClick,disabled}: {icon:string, label:string, sub?:string, color:string, bg:string, onClick?:()=>void, disabled?:boolean}) => (
  <div onClick={disabled?undefined:onClick} style={{display:"flex",alignItems:"center",gap:10,background:disabled?T.grey1:bg,border:`1px solid ${disabled?T.grey2:color}20`,borderRadius:12,padding:"11px 13px",marginBottom:8,cursor:disabled?"default":"pointer",opacity:disabled?.4:1}}>
    <span style={{fontSize:20}}>{icon}</span>
    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:disabled?T.textLight:color}}>{label}</div>{sub&&<div style={{fontSize:10,color:T.textLight,marginTop:1}}>{sub}</div>}</div>
    {!disabled&&<span style={{fontSize:14,color,opacity:.5}}>›</span>}
  </div>
);

function Sheet({open,onClose,title,tc,children}: {open:boolean, onClose:()=>void, title:string, tc?:string, children:any}) {
  if (!open) return null;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(7,26,69,.76)",display:"flex",alignItems:"flex-end",zIndex:300}}>
      <div style={{background:T.white,borderRadius:"22px 22px 0 0",width:"100%",maxHeight:"84%",overflowY:"auto",paddingBottom:24}}>
        <div style={{padding:"16px 20px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:800,color:tc||T.navy}}>{title}</span>
          <button onClick={onClose} style={{background:T.grey1,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>{children}</div>
      </div>
    </div>
  );
}

const BackBtn = ({label,onClick}: {label:string, onClick:()=>void}) => (
  <button onClick={onClick} style={{background:T.grey1,border:"none",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer",marginBottom:8}}>← {label}</button>
);

const TABS=[{id:"dash",icon:"🏠",label:"Accueil"},{id:"bail",icon:"📋",label:"Mon bail"},{id:"quitt",icon:"🧾",label:"Quittances"},{id:"util",icon:"⚡",label:"CIE/SODECI"},{id:"droits",icon:"⚖️",label:"Mes droits"},{id:"profil",icon:"👤",label:"Profil"}];

export function TenantPortalDashboard({ 
    user, 
    bail, 
    bailleur, 
    quittances, 
    abonnements, 
    tickets,
    caution, 
    mrlDemandes 
}: { 
    user: any, 
    bail: any, 
    bailleur: any, 
    quittances: any[], 
    abonnements: any[], 
    tickets: any[], 
    caution: any,
    mrlDemandes: any[]
}) {
  const [tab, setTab] = useState("dash");
  const [qSel, setQSel] = useState<any>(null);
  const [aSel, setASel] = useState<any>(null);
  const [dsec, setDsec] = useState<string | null>(null);
  const [rclCode, setRclCode] = useState<string | null>(null);
  const [rclSent, setRclSent] = useState(false);
  const [tSel, setTSel] = useState<any>(null);
  const [mrlChoice, setMrlChoice] = useState<string | null>(null);
  const [prStep, setPrStep] = useState(1);
  const [travauxType, setTravauxType] = useState<string | null>(null);
  const [travauxUrgent, setTravauxUrgent] = useState(false);
    const [O, setO] = useState<{ [key: string]: boolean }>({ 
        score: false, caution: false, export: false, ussd: false, notifs: false, pay: false, trust: false 
    });
    const op = (k: string) => setO(o => ({ ...o, [k]: true }));
    const cl = (k: string) => setO(o => ({ ...o, [k]: false }));

    const { numerosMM } = useMobileMoneyLocataire();
    const selNum = (numerosMM as any[])?.[0]; // Placeholder for selected number in Pay overlay

  const go = (t: string) => { 
    setTab(t); setQSel(null); setASel(null); setDsec(null); 
    setRclCode(null); setRclSent(false); setTSel(null); 
    setMrlChoice(null); setPrStep(1); setTravauxType(null); setTravauxUrgent(false); 
  };

  const sc = user?.score || 750;
  const scColor = sc>=850?T.green:sc>=700?T.teal:sc>=550?T.orange:T.red;

  const TICKET_ACTIF = useMemo(() => tickets?.find(t => t.statut === 'En attente bailleur'), [tickets]);
  const TICKET_RESOLU = useMemo(() => tickets?.find(t => t.statut !== 'En attente bailleur'), [tickets]);

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:T.bg,minHeight:"100vh",display:"flex",justifyContent:"center",padding:"20px 16px"}}>
      <div style={{width:390,background:T.white,borderRadius:36,boxShadow:`0 20px 70px ${T.navy}22`,overflow:"hidden",position:"relative",border:`1px solid ${T.grey2}`,minHeight:844}}>

        {/* STATUS */}
        <div style={{background:T.navyDark,padding:"12px 24px 0",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:11,fontWeight:700,color:T.white,opacity:.7,fontFamily:"monospace"}}>9:41</span>
          <div style={{display:"flex",gap:5}}>{["▮▮▮","WiFi","🔋"].map((s,i)=><span key={i} style={{fontSize:9,color:T.white,opacity:.7}}>{s}</span>)}</div>
        </div>

        {/* HEADER */}
        <div style={{background:`linear-gradient(145deg,${T.navy} 0%,${T.teal} 100%)`,padding:"14px 20px 18px",position:"relative",overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <div style={{background:T.teal,borderRadius:7,padding:"2px 9px",fontSize:9,fontWeight:900,color:T.white,letterSpacing:1.5,textTransform:"uppercase"}}>LOCATAIRE</div>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#5EE7B7"}}/>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:T.white}}>{(user?.fullName || user?.name || "Locataire").toUpperCase()}</div>
              <div style={{fontSize:11,color:T.white,opacity:.6,marginTop:2}}>Appt {bail?.logementRef || bail?.ref} · CID: {user?.id?.slice(-4)}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
              <div onClick={()=>op("notifs")} style={{width:38,height:38,borderRadius:12,background:T.white+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer"}}>🔔</div>
              {bail?.statut==="LOYER_IMPAYE"&&<Badge label={`Impayé`} color={T.white} bg={T.red} size={9}/>}
            </div>
          </div>
          {/* KPI */}
          <div style={{display:"flex",gap:7,marginTop:14}}>
            {[
              {l:"Loyer/mois",v:fmt(bail?.loyer || 0)+"F",icon:"💰",nav:null},
              {l:"Quittances",v:quittances?.filter(q=>q.statut?.includes("Cert")).length || 0,icon:"🧾",nav:()=>go("quitt")},
              {l:"Score ICL",v:sc,icon:"⭐",nav:()=>op("score")},
              {l:"Caution",v:caution?.montant ? fmt(caution.montant)+"F" : "—",icon:"🔒",nav:()=>op("caution")},
            ].map((k,i)=>(
              <div key={i} onClick={k.nav||undefined} style={{flex:1,background:T.white+"12",borderRadius:10,padding:"7px 5px",border:`1px solid ${T.white}15`,textAlign:"center",cursor:k.nav?"pointer":"default"}}>
                <div style={{fontSize:13}}>{k.icon}</div>
                <div style={{fontSize:12,fontWeight:800,color:T.white}}>{k.v}</div>
                <div style={{fontSize:8,color:T.white,opacity:.55,marginTop:1}}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div style={{overflowY:"auto",maxHeight:578,paddingBottom:90}}>

          {/* ══ ACCUEIL ══ */}
          {tab==="dash"&&(
            <div>
              {/* alerte SLA RCL (MM-03) */}
              {TICKET_ACTIF && (
                <div style={{margin:"14px 16px 0",background:TICKET_ACTIF.favorLocataire?T.greenPale:T.orangePale,border:`1.5px solid ${TICKET_ACTIF.favorLocataire?T.green:T.orange}40`,borderRadius:14,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontSize:11,fontWeight:800,color:TICKET_ACTIF.favorLocataire?T.green:T.orange}}>{TICKET_ACTIF.favorLocataire?"✓ Résolution en votre faveur":"⏳ Arbitrage QAPRIL en cours"}</div>
                    <Badge label={TICKET_ACTIF.code || "RCL"} color={T.white} bg={TICKET_ACTIF.favorLocataire?T.green:T.orange} size={8}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>{TICKET_ACTIF.sujet}</div>
                  {!TICKET_ACTIF.favorLocataire && (
                    <>
                      <div style={{height:5,background:T.white,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                        <div style={{height:"100%",width:`${TICKET_ACTIF.pourcentageTemps}%`,background:T.orange}}/>
                      </div>
                      <div style={{fontSize:10,color:T.textMid}}>Délai de réponse bailleur : <span style={{fontWeight:800}}>{Math.floor(TICKET_ACTIF.heuresRestantes)}h</span> restantes</div>
                    </>
                  )}
                  {TICKET_ACTIF.favorLocataire && (
                    <div style={{fontSize:10,color:T.green,fontWeight:700}}>Règle MM-03 : Délai 144h dépassé. La demande est validée par défaut.</div>
                  )}
                </div>
              )}

              {/* alerte impayé */}
              {bail?.statut==="LOYER_IMPAYE"&&(
                <div style={{margin:"14px 16px 0",background:T.redPale,border:`1px solid ${T.red}25`,borderRadius:13,padding:"12px 14px"}}>
                  <div style={{fontSize:12,fontWeight:800,color:T.red,marginBottom:4}}>⚠ Loyer en retard</div>
                  <div style={{fontSize:10,color:T.textMid,marginBottom:10}}>{fmt(bail?.loyer || 0)} FCFA non encaissé. Veuillez régulariser.</div>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>{go("droits");setDsec("rcl");setRclCode("RCL-02");}} style={{flex:1,background:T.red,border:"none",borderRadius:9,padding:"7px",fontSize:10,fontWeight:700,color:T.white,cursor:"pointer"}}>Signaler un problème</button>
                    <button onClick={()=>go("quitt")} style={{flex:1,background:T.white,border:`1px solid ${T.red}30`,borderRadius:9,padding:"7px",fontSize:10,fontWeight:700,color:T.red,cursor:"pointer"}}>Mes quittances</button>
                  </div>
                </div>
              )}

                <Sheet open={O.pay} onClose={()=>cl("pay")} title="Lancer le paiement">
                    <p style={{fontSize:12,color:T.textMid,marginBottom:20}}>Souhaitez-vous payer votre loyer de {bail?.rentAmount||bail?.loyer||'--'} FCFA via {selNum?.operator||'Mobile Money'} ?</p>
                    <button onClick={()=>alert("Lancement CinetPay...")} style={{width:"100%",background:T.green,color:T.white,borderRadius:12,padding:14,fontWeight:800,border:"none"}}>Confirmer le paiement</button>
                </Sheet>

                <Sheet open={O.trust} onClose={()=>cl("trust")} title="Portefeuille de Confiance (Phase 3)">
                    <div style={{background:T.tealPale,padding:12,borderRadius:10,marginBottom:15}}>
                        <div style={{fontSize:11,fontWeight:800,color:T.teal,marginBottom:4}}>PROTECTION DES DONNÉES</div>
                        <div style={{fontSize:10,color:T.teal,lineHeight:1.4}}>
                            Conformément au Manifeste QAPRIL, vous contrôlez qui accède à vos données locatives.
                        </div>
                    </div>
                    <SecTitle label="Accès Actifs"/>
                    <div style={{background:T.white,border:`1px solid ${T.grey2}`,borderRadius:12,padding:12,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                            <span style={{fontSize:20}}>🏢</span>
                            <div>
                                <div style={{fontSize:12,fontWeight:700}}>Agence KOUIZ-IMMO</div>
                                <div style={{fontSize:9,color:T.textLight}}>Accès : Quittances, Bail, RCL</div>
                            </div>
                        </div>
                        <button style={{background:T.redPale,color:T.red,border:"none",borderRadius:6,padding:"4px 8px",fontSize:9,fontWeight:800}}>RÉVOQUER</button>
                    </div>
                    <div style={{marginTop:20,textAlign:"center"}}>
                        <button onClick={()=>cl("trust")} style={{background:T.grey1,color:T.textMid,borderRadius:8,padding:"10px 20px",fontSize:11,fontWeight:700,border:"none"}}>Fermer</button>
                    </div>
                </Sheet>

              {/* logement */}
              <div style={{padding:"12px 16px 0"}}>
                <SecTitle label="Mon logement"/>
                <div onClick={()=>go("bail")} style={{background:`linear-gradient(135deg,${T.navy}08,${T.teal}08)`,border:`1px solid ${T.navy}15`,borderRadius:14,padding:13,cursor:"pointer"}}>
                  <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:4}}>{bail?.logementNom || "Logement QAPRIL"}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    <Badge label={bail?.type || "Bail Standard"} color={T.teal} bg={T.tealPale}/>
                    <Badge label={`Éch. le ${bail?.paymentDay || 1}er`} color={T.navy} bg={T.navyPale}/>
                  </div>
                  {/* bailleur conditionnel */}
                  <div style={{background:T.grey1,borderRadius:9,padding:"8px 10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div>
                        <div style={{fontSize:9,color:T.textLight,fontWeight:700,letterSpacing:.5,marginBottom:2}}>{bail?.typeGestion==="agreee"?"AGENCE":"BAILLEUR"}</div>
                        <div style={{fontSize:11,fontWeight:700,color:T.textMid}}>{bail?.typeGestion==="agreee" ? (bail?.agencyName || "Agence Agréée") : bailleur?.valeur}</div>
                      </div>
                      {bail?.typeGestion==="agreee"&&(
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:9,color:T.textLight,fontWeight:700,marginBottom:2}}>RÉF. BAILLEUR</div>
                          <div style={{fontSize:11,fontWeight:700,color:T.grey3}}>{bailleur?.valeur}</div>
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:9,color:T.textLight,marginTop:5,fontStyle:"italic"}}>🔐 {bailleur?.mention}</div>
                  </div>
                </div>
              </div>
              {/* aperçu quittance */}
              {(()=>{const q=quittances?.[0]; return q&&(
                <div style={{padding:"12px 16px 0"}}>
                  <SecTitle label="Dernière quittance" right={<button onClick={()=>go("quitt")} style={{background:"none",border:"none",fontSize:10,fontWeight:700,color:T.teal,cursor:"pointer"}}>Tout voir →</button>}/>
                  <div onClick={()=>{go("quitt");setQSel(q);}} style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderLeft:`4px solid ${T.green}`,borderRadius:12,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{q.period} — {fmt(q.amount)} FCFA</div><div style={{fontSize:9,color:T.textLight,marginTop:1,fontFamily:"monospace"}}>{q.reference}</div></div>
                      <Badge label="✓ Certifiée" color={T.green} bg={T.white}/>
                    </div>
                  </div>
                </div>
              );})()}
            </div>
          )}

          {/* ══ MON BAIL ══ */}
          {tab==="bail"&&(
            <div style={{padding:"12px 16px 0"}}>
              <div style={{background:`linear-gradient(135deg,${T.navy}08,${T.teal}08)`,border:`1px solid ${T.navy}15`,borderRadius:14,padding:13,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>{bail?.logementNom}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  <Badge label={bail?.type} color={T.navy} bg={T.navyPale}/>
                  <Badge label={bail?.ref} color={T.textLight} bg={T.grey1} size={9}/>
                  {bail?.statut==="LOYER_IMPAYE"?<Badge label={`Retard`} color={T.white} bg={T.red}/>:<Badge label="À jour" color={T.green} bg={T.greenPale}/>}
                </div>
              </div>
              <Row label="Référence" value={bail?.ref}/>
              <Row label="Loyer mensuel" value={fmt(bail?.loyer || 0)+" FCFA"} color={T.navy}/>
              <Row label="Échéance" value={`Le ${bail?.paymentDay || 1}er du mois`}/>
              {/* bloc bailleur */}
              <div style={{marginTop:10,background:T.grey1,borderRadius:12,padding:"11px 12px",marginBottom:10}}>
                <SecTitle label="Bailleur & Gestion"/>
                <Row label={bail?.typeGestion==="agreee"?"Agence":"Propriétaire"} value={bail?.typeGestion==="agreee"?bail?.agencyName:bailleur?.valeur} color={T.navy}/>
                <div style={{marginTop:8,background:T.navyPale,borderRadius:9,padding:"7px 10px",fontSize:9,color:T.textMid}}>🔐 {bailleur?.mention}</div>
              </div>
            </div>
          )}

          {/* ══ QUITTANCES ══ */}
          {tab==="quitt"&&!qSel&&(
            <div style={{padding:"12px 16px 0"}}>
               {quittances?.map((q,i)=>(
                <div key={i} onClick={()=>setQSel(q)} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${T.green}`,borderRadius:12,padding:"10px 12px",marginBottom:8,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{q.period} — {fmt(q.amount)} FCFA</div><div style={{fontSize:9,color:T.textLight,marginTop:1,fontFamily:"monospace"}}>{q.reference}</div></div>
                    <Badge label="Certifiée" color={T.green} bg={T.greenPale}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ MES DROITS ══ */}
          {tab==="droits"&&!dsec&&!tSel&&(
            <div style={{padding:"12px 16px 0"}}>
               <SecTitle label="Tickets en cours"/>
               {TICKET_ACTIF ? (
                 <div style={{background:T.orangePale,border:`1.5px solid ${T.orange}30`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.text}}>{TICKET_ACTIF.sujet}</div>
                    <div style={{fontSize:9,color:T.textLight,marginTop:1}}>Soumis le {new Date(TICKET_ACTIF.createdAt).toLocaleDateString()}</div>
                 </div>
               ) : <div style={{fontSize:10,color:T.textLight,padding:10}}>Aucun ticket actif.</div>}
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div style={{position:"absolute",bottom:0,width:"100%",background:T.white,borderTop:`1px solid ${T.grey2}`,display:"flex",padding:"10px 20px 24px"}}>
          {TABS.map(t=>(
            <div key={t.id} onClick={()=>go(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:tab===t.id?1:.4}}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <span style={{fontSize:8,fontWeight:900,textTransform:"uppercase",marginTop:3,color:T.navy}}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
