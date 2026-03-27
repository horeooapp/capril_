"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Theme Colors from Validated JSX
const T = {
  navy:"#0D2B6E",navyDark:"#071A45",navyLight:"#1A3D8C",navyPale:"#EEF2FA",
  green:"#1A7A3C",greenLight:"#22A050",greenPale:"#E8F5EE",
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

// --- COMPONENTS ---
const Badge = ({label,color,bg,size=10}: {label:any, color:string, bg:string, size?:number}) => (
  <span style={{display:"inline-flex",alignItems:"center",background:bg,color,borderRadius:6,padding:"2px 7px",fontSize:size,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);

const Chip = ({label,active,onClick}: {label:string, active:boolean, onClick:()=>void}) => (
  <button onClick={onClick} style={{border:"none",cursor:"pointer",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,background:active?T.navy:T.grey1,color:active?T.white:T.textLight}}>{label}</button>
);

const Row = ({label,value,color}: {label:string, value:any, color?:string}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.grey1}`}}>
    <span style={{fontSize:10,color:T.textLight}}>{label}</span>
    <span style={{fontSize:11,fontWeight:700,color:color||T.textMid}}>{value}</span>
  </div>
);

const BackBtn = ({label,onClick}: {label:string, onClick:()=>void}) => (
  <button onClick={onClick} style={{background:T.grey1,border:"none",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>← {label}</button>
);

const SecTitle = ({label}: {label:string}) => (
  <div style={{fontSize:10,fontWeight:800,color:T.textLight,letterSpacing:1,textTransform:"uppercase",marginBottom:8,marginTop:4}}>{label}</div>
);

function Overlay({open,onClose,title,titleColor,children,maxH="82%"}: {open:boolean, onClose:()=>void, title:string, titleColor?:string, children:any, maxH?:string}) {
  if (!open) return null;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(7,26,69,0.76)",display:"flex",alignItems:"flex-end",zIndex:300}}>
      <div style={{background:T.white,borderRadius:"22px 22px 0 0",width:"100%",maxHeight:maxH,overflowY:"auto",paddingBottom:24}}>
        <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:14,fontWeight:800,color:titleColor||T.navy}}>{title}</span>
          <button onClick={onClose} style={{background:T.grey1,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px"}}>{children}</div>
      </div>
    </div>
  );
}

const TABS = [
  {id:"dashboard",icon:"📊",label:"Tableau"},
  {id:"biens",icon:"🏘",label:"Patrimoine"},
  {id:"quittances",icon:"🧾",label:"Quittances"},
  {id:"cautions",icon:"🔒",label:"Cautions"},
  {id:"profil",icon:"👤",label:"Profil"},
];

export function OwnerPortalDashboard({ user, properties: initialProperties }: { user: any, properties: any[] }) {
    const [tab, setTab] = useState("dashboard")
    const [selectedEntite, setSelectedEntite] = useState<any>(null)
    const [selectedUnite, setSelectedUnite] = useState<any>(null)
    const [filterBiens, setFilterBiens] = useState("tous")
    const [unitTab, setUnitTab] = useState("info")
    const [O, setO] = useState<any>({});

    const open = (k: string) => setO((o: any) => ({...o, [k]: true}));
    const close = (k: string) => setO((o: any) => ({...o, [k]: false}));

    // Data Processing: Mimicking 3-level hierarchy from flat properties
    const entities = useMemo(() => {
        const grouped = initialProperties.reduce((acc: any, p: any) => {
            const key = p.address;
            if (!acc[key]) {
                acc[key] = {
                    id: `E-${p.id}`,
                    code: p.propertyCode || `IMM-${p.id}`,
                    nom: p.name || p.address,
                    adresse: p.address,
                    commune: p.commune,
                    type: p.propertyType === 'building' ? 'immeuble' : p.propertyType === 'court' ? 'cour' : 'standalone',
                    unites: []
                };
            }
            acc[key].unites.push({
                ...p,
                label: p.name || "Unité",
                statut: p.status === 'active' ? 'occupé' : 'vacant',
                paiement: p.leases?.[0]?.statutFiscal === 'A_JOUR' ? "À jour" : p.leases?.[0]?.statutFiscal === 'EN_RETARD' ? "Impayé" : "—",
                loyer: p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0,
                retard: p.leases?.[0]?.daysOverdue || 0,
                locataire: p.leases?.[0]?.tenant?.fullName || p.leases?.[0]?.tenant?.name
            });
            return acc;
        }, {});

        return Object.values(grouped).map((e: any) => {
            if (e.unites.length > 1 && e.type === 'standalone') e.type = 'immeuble';
            return e;
        });
    }, [initialProperties]);

    const stats = useMemo(() => {
        const toutes = entities.flatMap(e => e.type === 'standalone' ? e.unites : e.unites);
        const totalLoyers = toutes.filter(u => u.statut === 'occupé').reduce((s, u) => s + u.loyer, 0);
        const encaisse = toutes.filter(u => u.paiement === 'À jour').reduce((s, u) => s + u.loyer, 0);
        const impayesN = toutes.filter(u => u.paiement === 'Impayé').length;
        const vacants = toutes.filter(u => u.statut === 'vacant').length;
        return { totalLoyers, encaisse, impayesN, vacants };
    }, [entities]);

    const resetNav = (t: string) => {
        setTab(t); setSelectedEntite(null); setSelectedUnite(null); setUnitTab("info");
    };

    const entiteStats = (e: any) => {
        const us = e.unites || [];
        return {
            total: us.length,
            occupes: us.filter((u: any) => u.statut === 'occupé').length,
            vacants: us.filter((u: any) => u.statut === 'vacant').length,
            impayes: us.filter((u: any) => u.paiement === 'Impayé').length,
            loyers: us.reduce((s: number, u: any) => s + u.loyer, 0)
        };
    };

    const entiteIcon = (type: string) => 
        type === 'immeuble' ? "🏢" : type === 'cour' ? "🏡" : "🏠";

    const pColor = (u: any) => 
        u.paiement === "Impayé" ? T.red : u.statut === "vacant" ? T.grey3 : T.green;

    return (
        <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:T.bg,minHeight:"100vh",display:"flex",justifyContent:"center",padding:"20px 16px"}}>
            <div style={{width:390,background:T.white,borderRadius:36,boxShadow:`0 24px 80px ${T.navy}25`,overflow:"hidden",position:"relative",border:`1px solid ${T.grey2}`,minHeight:844}}>
                
                {/* HEADER */}
                <div style={{background:`linear-gradient(145deg,${T.navyDark} 0%,${T.green} 100%)`,padding:"14px 20px 20px",position:"relative"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                                <div style={{background:T.green,borderRadius:7,padding:"2px 9px",fontSize:9,fontWeight:900,color:T.white,letterSpacing:1.5,textTransform:"uppercase"}}>PROPRIÉTAIRE</div>
                                <div style={{width:6,height:6,borderRadius:"50%",background:T.greenLight}}/>
                            </div>
                            <div style={{fontSize:17,fontWeight:800,color:T.white}}>{(user?.name || "PROPRIÉTAIRE").toUpperCase()}</div>
                            <div style={{fontSize:11,color:T.white,opacity:.6}}>V4.0 Certifiée QAPRIL</div>
                        </div>
                        <div onClick={() => open("notifs")} style={{width:38,height:38,borderRadius:12,background:T.white+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer"}}>🔔</div>
                    </div>
                </div>

                {/* BODY */}
                <div style={{overflowY:"auto",maxHeight:590,paddingBottom:80}}>
                    
                    {/* ACCUEIL */}
                    {tab === "dashboard" && (
                        <div style={{padding:"14px 16px"}}>
                            <div style={{background:`linear-gradient(135deg,${T.navy}08,${T.green}08)`,border:`1px solid ${T.navy}15`,borderRadius:16,padding:14}}>
                                <div style={{fontSize:10,fontWeight:700,color:T.textLight,textTransform:"uppercase"}}>Encaissement global</div>
                                <div style={{fontSize:24,fontWeight:900,color:T.navy,marginTop:4}}>{fmt(stats.encaisse)} <span style={{fontSize:12}}>FCFA</span></div>
                                <div style={{marginTop:12,height:6,background:T.grey1,borderRadius:4,overflow:"hidden"}}>
                                    <div style={{height:"100%",width:`${(stats.encaisse/Math.max(stats.totalLoyers, 1))*100}%`,background:T.green,borderRadius:4}}/>
                                </div>
                            </div>
                            
                            <div style={{marginTop:20}}>
                                <SecTitle label="Mon patrimoine"/>
                                {entities.slice(0, 3).map(e => {
                                    const s = entiteStats(e);
                                    return (
                                        <div key={e.id} onClick={() => {setSelectedEntite(e); setTab("biens");}} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${s.impayes>0?T.red:T.green}`,borderRadius:12,padding:12,marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
                                            <div style={{display:"flex",gap:10}}>
                                                <span style={{fontSize:20}}>{entiteIcon(e.type)}</span>
                                                <div>
                                                    <div style={{fontSize:12,fontWeight:700}}>{e.nom}</div>
                                                    <div style={{fontSize:10,color:T.textLight}}>{e.unites.length} unités · {e.commune}</div>
                                                </div>
                                            </div>
                                            <div style={{textAlign:"right"}}>
                                                <div style={{fontSize:12,fontWeight:800}}>{fmt(s.loyers)}</div>
                                                <div style={{fontSize:8,color:T.textLight}}>FCFA/mois</div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <button onClick={() => resetNav("biens")} style={{width:"100%",background:T.navyPale,border:"none",borderRadius:10,padding:10,fontSize:11,fontWeight:700,color:T.navy,cursor:"pointer"}}>Voir tout le parc →</button>
                            </div>
                        </div>
                    )}

                    {/* PATRIMOINE - LISTE */}
                    {tab === "biens" && !selectedEntite && (
                        <div style={{padding:"14px 16px"}}>
                            <div style={{display:"flex",gap:6,marginBottom:12}}>
                                {["tous","occupés","vacants","impayés"].map(f => <Chip key={f} label={f.charAt(0).toUpperCase()+f.slice(1)} active={filterBiens===f} onClick={() => setFilterBiens(f)} />)}
                            </div>
                            {entities.map(e => {
                                const s = entiteStats(e);
                                return (
                                    <div key={e.id} onClick={() => setSelectedEntite(e)} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${s.impayes>0?T.red:T.green}`,borderRadius:14,padding:14,marginBottom:10,cursor:"pointer"}}>
                                        <div style={{display:"flex",justifyContent:"space-between"}}>
                                            <div style={{display:"flex",gap:10}}>
                                                <div style={{width:40,height:40,background:T.navyPale,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{entiteIcon(e.type)}</div>
                                                <div>
                                                    <div style={{fontSize:13,fontWeight:800}}>{e.nom}</div>
                                                    <div style={{fontSize:10,color:T.textLight}}>{e.adresse}</div>
                                                    <div style={{display:"flex",gap:4,marginTop:5}}>
                                                        <Badge label={e.type} color={T.navy} bg={T.navyPale}/>
                                                        <Badge label={`${s.occupes} occupés`} color={T.green} bg={T.greenPale}/>
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{fontSize:18,color:T.grey2}}>›</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* FICHE ENTITE */}
                    {tab === "biens" && selectedEntite && !selectedUnite && (
                        <div style={{padding:"14px 16px"}}>
                            <BackBtn label="Patrimoine" onClick={() => setSelectedEntite(null)}/>
                            <div style={{marginTop:12,padding:14,background:T.grey1,borderRadius:16}}>
                                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                                    <span style={{fontSize:24}}>{entiteIcon(selectedEntite.type)}</span>
                                    <div>
                                        <div style={{fontSize:14,fontWeight:800}}>{selectedEntite.nom}</div>
                                        <div style={{fontSize:11,color:T.textLight}}>{selectedEntite.adresse}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{marginTop:20}}>
                                <SecTitle label="Unités locatives"/>
                                {selectedEntite.unites.map((u: any) => (
                                    <div key={u.id} onClick={() => {setSelectedUnite(u); setUnitTab("info");}} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${pColor(u)}`,borderRadius:12,padding:12,marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                        <div>
                                            <div style={{fontSize:12,fontWeight:700}}>{u.name || u.label}</div>
                                            <div style={{fontSize:10,color:T.textLight}}>{u.locataire || "Vacant"}</div>
                                        </div>
                                        <div style={{textAlign:"right"}}>
                                            <div style={{fontSize:12,fontWeight:800}}>{fmt(u.loyer)}</div>
                                            <div style={{fontSize:8,color:T.textLight}}>FCFA</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{marginTop:20,borderTop:`1px solid ${T.grey1}`,paddingTop:15}}>
                                    <button onClick={() => open("retirer")} style={{width:"100%",background:T.redPale,color:T.red,border:`1px solid ${T.red}20`,borderRadius:10,padding:12,fontSize:11,fontWeight:700}}>🗑 Retirer cette entité du portefeuille</button>
                                    <p style={{fontSize:9,color:T.textLight,textAlign:"center",marginTop:6}}>Action irréversible · Archivage légal 10 ans</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FICHE UNITE */}
                    {tab === "biens" && selectedEntite && selectedUnite && (
                        <div style={{padding:"14px 16px"}}>
                            <BackBtn label={selectedEntite.nom} onClick={() => setSelectedUnite(null)}/>
                            <div style={{marginTop:12,padding:14,background:T.grey1,borderRadius:16}}>
                                <div style={{fontSize:14,fontWeight:800}}>{selectedUnite.name || selectedUnite.label}</div>
                                <div style={{fontSize:11,color:T.textLight}}>{selectedEntite.nom} · {selectedEntite.commune}</div>
                                <div style={{display:"flex",gap:5,marginTop:6}}>
                                    <Badge label={selectedUnite.propertyType || "Unit"} color={T.navy} bg={T.navyPale}/>
                                    {selectedUnite.statut === "occupé" ? <Badge label="Occupé" color={T.green} bg={T.greenPale}/> : <Badge label="Vacant" color={T.grey4} bg={T.grey1}/>}
                                </div>
                            </div>
                            
                            <div style={{display:"flex",borderBottom:`1px solid ${T.grey2}`,marginTop:15}}>
                                {["info","bail","locataire","actions"].map(t => (
                                    <button key={t} onClick={() => setUnitTab(t)} style={{flex:1,padding:8,fontSize:10,fontWeight:700,color:unitTab===t?T.navy:T.textLight,borderBottom:unitTab===t?`2px solid ${T.navy}`:"none",textTransform:"capitalize"}}>{t}</button>
                                ))}
                            </div>
                            
                            <div style={{padding:"15px 0"}}>
                                {unitTab === "info" && (
                                    <div>
                                        <Row label="Code" value={selectedUnite.propertyCode}/>
                                        <Row label="Loyer" value={fmt(selectedUnite.loyer)+" FCFA"} color={T.navy}/>
                                        <Row label="Commune" value={selectedEntite.commune}/>
                                    </div>
                                )}
                                {unitTab === "locataire" && (
                                    <div>
                                        {selectedUnite.locataire ? (
                                            <>
                                                <Row label="Nom" value={selectedUnite.locataire}/>
                                                <Row label="Paiement" value={selectedUnite.paiement} color={selectedUnite.paiement === "À jour" ? T.green : T.red}/>
                                                {selectedUnite.paiement === "Impayé" && (
                                                    <div style={{marginTop:10,display:"flex",gap:7}}>
                                                        <button onClick={() => open("relance")} style={{flex:1,background:T.redPale,color:T.red,border:`1px solid ${T.red}20`,borderRadius:8,padding:8,fontSize:10,fontWeight:700}}>Relancer</button>
                                                        <button onClick={() => open("clemence")} style={{flex:1,background:T.orangePale,color:T.orange,border:`1px solid ${T.orange}20`,borderRadius:8,padding:8,fontSize:10,fontWeight:700}}>Clémence</button>
                                                    </div>
                                                )}
                                            </>
                                        ) : <div style={{textAlign:"center",padding:20,color:T.textLight}}>Vacant</div>}
                                    </div>
                                )}
                                {unitTab === "actions" && (
                                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                        <button onClick={() => open("emitQuit")} style={{background:T.greenPale,color:T.green,border:`1px solid ${T.green}20`,borderRadius:10,padding:12,fontSize:12,fontWeight:700,textAlign:"left"}}>🧾 Émettre une quittance</button>
                                        <button style={{background:T.navyPale,color:T.navy,border:`1px solid ${T.navy}20`,borderRadius:10,padding:12,fontSize:12,fontWeight:700,textAlign:"left"}}>📄 Voir le bail PDF</button>
                                        <button style={{background:T.redPale,color:T.red,border:`1px solid ${T.red}20`,borderRadius:10,padding:12,fontSize:12,fontWeight:700,textAlign:"left"}}>🗑 Résilier le bail</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* NAVIGATION */}
                <div style={{position:"absolute",bottom:0,width:"100%",background:T.white,borderTop:`1px solid ${T.grey2}`,display:"flex",padding:"10px 10px 24px"}}>
                    {TABS.map(t => (
                        <div key={t.id} onClick={() => resetNav(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:tab===t.id?1:.4}}>
                            <span style={{fontSize:20}}>{t.icon}</span>
                            <span style={{fontSize:8,fontWeight:900,marginTop:3,color:T.navy,textTransform:"uppercase"}}>{t.label}</span>
                        </div>
                    ))}
                </div>
                
                {/* OVERLAYS */}
                <Overlay open={O.relance} onClose={() => close("relance")} title="Relancer le locataire" titleColor={T.red}>
                    <p style={{fontSize:12,color:T.textMid}}>Voulez-vous envoyer une relance SMS/WhatsApp au locataire ?</p>
                    <button style={{width:"100%",background:T.red,color:T.white,borderRadius:10,padding:12,marginTop:20,fontWeight:800,border:"none"}}>Envoyer la relance</button>
                </Overlay>

                <Overlay open={O.clemence} onClose={() => close("clemence")} title="Accorder une clémence (M07)" titleColor={T.orange}>
                    <p style={{fontSize:12,color:T.textMid}}>Accordez un délai supplémentaire ou un plan de paiement.</p>
                    <button style={{width:"100%",background:T.orange,color:T.white,borderRadius:10,padding:12,marginTop:20,fontWeight:800,border:"none"}}>Valider la clémence</button>
                </Overlay>

                <Overlay open={O.emitQuit} onClose={() => close("emitQuit")} title="Émettre une quittance">
                    <p style={{fontSize:12,color:T.textMid}}>Confirmez l'encaissement pour {selectedUnite?.label}.</p>
                    <button style={{width:"100%",background:T.green,color:T.white,borderRadius:10,padding:12,marginTop:20,fontWeight:800,border:"none"}}>Confirmer & Certifier (SHA-256)</button>
                </Overlay>

                <Overlay open={O.retirer} onClose={() => close("retirer")} title="Retrait de bien (Règle Phase 2)" titleColor={T.red}>
                    <div style={{background:T.redPale,padding:12,borderRadius:10,marginBottom:15}}>
                        <div style={{fontSize:11,fontWeight:800,color:T.red,marginBottom:4}}>⚠️ AVERTISSEMENT CRITIQUE</div>
                        <div style={{fontSize:10,color:T.red,lineHeight:1.4}}>
                            1. Le bien sera archivé pendant 10 ans (DGI).<br/>
                            2. SMS + WhatsApp seront envoyés aux locataires.<br/>
                            3. Le mandat d'agence (si présent) sera résilié.
                        </div>
                    </div>
                    <button onClick={() => alert("Action soft-delete lancée")} style={{width:"100%",background:T.red,color:T.white,borderRadius:10,padding:14,fontWeight:800,border:"none"}}>CONFIRMER LE RETRAIT</button>
                    <button onClick={() => close("retirer")} style={{width:"100%",background:T.white,color:T.textLight,borderRadius:10,padding:10,marginTop:8,fontWeight:700,border:"none"}}>Annuler</button>
                </Overlay>

            </div>
        </div>
    )
}
