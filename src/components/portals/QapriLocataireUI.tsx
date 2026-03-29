import { useState } from "react";

// --- TYPES & INTERFACES ---

export interface LocataireData {
  nom: string;
  tel: string;
  depuis: string;
  score: number;
  scoreBase: number;
  scoreKyc: number;
  scoreBadge?: string;
  walletBalance?: number;
  kycComplet: boolean;
  kycEtapes: { label: string; pts: number | string; ok: boolean; icon: string }[];
}

export interface BailData {
  ref: string;
  type: string;
  logement: string;
  adresse: string;
  code: string;
  loyer: number;
  charges?: number;
  total?: number;
  debut: string;
  fin: string | null;
  echeanceJour: number;
  sha: string | null;
  statut: string;
  retard: number;
  typeGestion: string;
  agence: string | null;
  bailleurNom: string | null;
  bailleurCode: string | null;
  bailleurMasque: boolean;
}

export interface QuittanceData {
  id: string;
  ref: string;
  periode: string;
  mois?: string;
  montant: number;
  statut: string;
  date: string;
  sha: string | null;
  url?: string | null;
}

export interface AboData {
  id: string;
  type: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
  compteur: string;
  montant: number;
  statut: string;
  mois: string;
  mode: string;
  hist: (number | null)[];
}

export interface TicketData {
  id: string;
  type?: string;
  code?: string;
  label?: string;
  description?: string;
  statut?: string;
  date?: string;
  echeance?: string;
  reference?: string;
  heures?: number;
  montant?: number;
  color?: string;
  delai?: string;
  resolution?: string;
  timeline?: any[];
}

interface QapriLocataireUIProps {
  loc: LocataireData;
  bail: BailData;
  quittances: QuittanceData[];
  abos: AboData[];
  tickets: TicketData[];
}

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

const Badge = ({label,color,bg,size=10}: {label: string, color: string, bg: string, size?: number}) => (
  <span style={{display:"inline-flex",alignItems:"center",background:bg,color,borderRadius:6,padding:"2px 7px",fontSize:size,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);
const Row = ({label,value,color}: {label: string, value: any, color?: string}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.grey1}`}}>
    <span style={{fontSize:10,color:T.textLight}}>{label}</span>
    <span style={{fontSize:11,fontWeight:700,color:color||T.textMid}}>{value}</span>
  </div>
);
const SecTitle = ({label,right}: {label: string, right?: any}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
    <div style={{fontSize:10,fontWeight:800,color:T.textLight,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
    {right}
  </div>
);
const ACard = ({icon,label,sub,color,bg,onClick,disabled}: {icon: string, label: string, sub?: string, color: string, bg: string, onClick?: any, disabled?: boolean}) => (
  <div onClick={disabled?undefined:onClick} style={{display:"flex",alignItems:"center",gap:10,background:disabled?T.grey1:bg,border:`1px solid ${disabled?T.grey2:color}20`,borderRadius:12,padding:"11px 13px",marginBottom:8,cursor:disabled?"default":"pointer",opacity:disabled?.4:1}}>
    <span style={{fontSize:20}}>{icon}</span>
    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:disabled?T.textLight:color}}>{label}</div>{sub&&<div style={{fontSize:10,color:T.textLight,marginTop:1}}>{sub}</div>}</div>
    {!disabled&&<span style={{fontSize:14,color,opacity:.5}}>›</span>}
  </div>
);
function Sheet({open,onClose,title,tc,children}: {open: boolean, onClose: any, title: string, tc?: string, children: any}) {
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
const BackBtn = ({label,onClick}: {label: string, onClick: any}) => (
  <button onClick={onClick} style={{background:T.grey1,border:"none",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer",marginBottom:8}}>← {label}</button>
);

const RCL = [
  {code:"RCL-01",label:"Quittance incorrecte",          sub:"Montant, période ou nom erroné",                        icon:"🧾"},
  {code:"RCL-02",label:"Paiement sans quittance",       sub:"Preuve Mobile Money + aucune quittance émise",          icon:"💸"},
  {code:"RCL-03",label:"Charges non contractuelles",    sub:"Montant hors bail enregistré",                         icon:"💰"},
  {code:"RCL-04",label:"Harcèlement ou pression",       sub:"Tentative expulsion informelle ou pressions",           icon:"🚨"},
  {code:"RCL-05",label:"Demande de travaux",            sub:"Réparation urgente · entretien · mise en conformité",   icon:"🔧",
   travaux:true, types:["Fuite d'eau / plomberie","Électricité défectueuse","Peinture / humidité / moisissures","Menuiserie (portes, fenêtres)","Climatisation / ventilation","Nuisibles / désinsectisation","Autre"]},
];

const TICKET_ACTIF_MOCK = {
  id:"TKT-002",code:"RCL-02",label:"Loyer Mars 2026 payé — quittance manquante",
  date:"20/03/2026 · 10h23",heures:38,echeance:"26/03/2026 · 10h23",montant:150000,
  timeline:[
    {h:"20/03 · 10h23",evt:"Ticket soumis par le locataire",icon:"📋",c:T.textLight},
    {h:"20/03 · 10h24",evt:"Bailleur notifié — SMS + WhatsApp + Dashboard QAPRIL",icon:"📲",c:T.teal},
    {h:"20/03 · 10h24",evt:"Délai 144h démarré — expiration le 26/03 à 10h23",icon:"⏳",c:T.orange},
  ],
};
const TICKET_RESOLU_MOCK = {
  id:"TKT-001",code:"RCL-02",label:"Paiement encaissé sans quittance",
  date:"15/02/2026",statut:"Résolu",color:T.green,montant:150000,delai:"144h",
  resolution:"Bailleur a répondu dans le délai · Quittance QIT-2026-0155 émise",
  timeline:[
    {h:"15/02 · 10h23",evt:"Ticket soumis",icon:"📋",c:T.textLight},
    {h:"15/02 · 10h24",evt:"Bailleur notifié — SMS + WhatsApp + Dashboard",icon:"📲",c:T.teal},
    {h:"15/02 · 16h45",evt:"Bailleur a confirmé le paiement",icon:"✅",c:T.green},
    {h:"15/02 · 16h47",evt:"Quittance QIT-2026-0155 certifiée SHA-256 émise",icon:"🧾",c:T.green},
    {h:"15/02 · 16h47",evt:"Ticket fermé en faveur du locataire",icon:"🔒",c:T.green},
  ],
};

const TABS=[{id:"dash",icon:"🏠",label:"Accueil"},{id:"bail",icon:"📋",label:"Mon bail"},{id:"quitt",icon:"🧾",label:"Quittances"},{id:"util",icon:"⚡",label:"CIE/SODECI"},{id:"manual",icon:"📖",label:"Manuel"},{id:"droits",icon:"⚖️",label:"Mes droits"},{id:"profil",icon:"👤",label:"Profil"}];

export default function QAPRILLocataire({ loc, bail, quittances, abos, tickets }: QapriLocataireUIProps) {
  const getBailleur = () => {
    if (bail.typeGestion==="agreee") return {val:bail.bailleurCode, masque:true, mention:"Agence agréée — substitution totale exclusive"};
    if (bail.bailleurMasque)        return {val:bail.bailleurCode, masque:true, mention:"Le propriétaire a choisi de ne pas divulguer son identité"};
    return {val:bail.bailleurNom, masque:false, mention:"Gestion directe — identité visible"};
  };
  const BAILLEUR = getBailleur();

  const [tab,setTab]               = useState<string>("dash");
  const [qSel,setQSel]             = useState<QuittanceData | null>(null);   // quittance sélectionnée
  const [aSel,setASel]             = useState<AboData | null>(null);   // abonnement sélectionné
  const [dsec,setDsec]             = useState<string | null>(null);   // section droits
  const [rclCode,setRclCode]       = useState<string | null>(null);   // type réclamation choisi
  const [rclSent,setRclSent]       = useState<boolean>(false);  // réclamation envoyée
  const [tSel,setTSel]             = useState<TicketData | null>(null);   // ticket sélectionné
  const [mrlChoice,setMrlChoice]   = useState<string | null>(null);   // oui/non MRL
  const [prStep,setPrStep]         = useState<number>(1);      // préavis étape
  const [O,setO]                   = useState({score:false,caution:false,export:false,ussd:false,notifs:false});
  const [travauxType, setTravauxType] = useState<string | null>(null);  // type de travaux sélectionné
  const [travauxUrgent, setTravauxUrgent] = useState<boolean>(false);
  const op = (k: string) => setO(o=>({...o,[k]:true}));
  const cl = (k: string) => setO(o=>({...o,[k]:false}));

  const go = (t: string) => { setTab(t);setQSel(null);setASel(null);setDsec(null);setRclCode(null);setRclSent(false);setTSel(null);setMrlChoice(null);setPrStep(1);setTravauxType(null);setTravauxUrgent(false); };

  const sc = loc.score;
  const scColor = sc>=850?T.green:sc>=700?T.teal:sc>=550?T.orange:T.red;

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
          <div style={{fontSize:16,fontWeight:800,color:T.white}}>{loc.nom.toUpperCase()}</div>
          <div style={{fontSize:11,color:T.white,opacity:.6,marginTop:2}}>Depuis {bail.debut} · {bail.logement}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <div onClick={()=>op("notifs")} style={{width:38,height:38,borderRadius:12,background:T.white+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer"}}>🔔</div>
          {bail.statut==="Impayé"&&<Badge label={`J+${bail.retard}`} color={T.white} bg={T.red} size={9}/>}
        </div>
      </div>
      {/* KPI */}
      <div style={{display:"flex",gap:7,marginTop:14}}>
        {[
          {l:"Loyer/mois",v:fmt(bail.loyer)+"F",icon:"💰",nav:null},
          {l:"Quittances",v:quittances.filter(q=>q.statut==="Certifiée").length,icon:"🧾",nav:()=>go("quitt")},
          {l:"Score ICL",v:sc,icon:"⭐",nav:()=>op("score")},
          {l:"Caution",v:"—",icon:"🔒",nav:()=>op("caution")},
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
          {/* alerte impayé */}
          {bail.statut==="Impayé"&&(
            <div style={{margin:"14px 16px 0",background:T.redPale,border:`1px solid ${T.red}25`,borderRadius:13,padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.red,marginBottom:4}}>⚠ Loyer Mars 2026 — J+{bail.retard}</div>
              <div style={{fontSize:10,color:T.textMid,marginBottom:10}}>{fmt(bail.loyer)} FCFA non encaissé. Si vous avez payé, soumettez votre justificatif.</div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>{go("droits");setDsec("rcl");setRclCode("RCL-02");}} style={{flex:1,background:T.red,border:"none",borderRadius:9,padding:"7px",fontSize:10,fontWeight:700,color:T.white,cursor:"pointer"}}>Signaler un problème</button>
                <button onClick={()=>go("quitt")} style={{flex:1,background:T.white,border:`1px solid ${T.red}30`,borderRadius:9,padding:"7px",fontSize:10,fontWeight:700,color:T.red,cursor:"pointer"}}>Mes quittances</button>
              </div>
            </div>
          )}
          {/* logement */}
          <div style={{padding:"12px 16px 0"}}>
            <SecTitle label="Mon logement"/>
            <div onClick={()=>go("bail")} style={{background:`linear-gradient(135deg,${T.navy}08,${T.teal}08)`,border:`1px solid ${T.navy}15`,borderRadius:14,padding:13,cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:800,color:T.text,marginBottom:4}}>{bail.logement}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                <Badge label={bail.type} color={T.teal} bg={T.tealPale}/>
                <Badge label={`Fin : ${bail.fin}`} color={T.textLight} bg={T.grey1}/>
                <Badge label={`Éch. le ${bail.echeanceJour}er`} color={T.navy} bg={T.navyPale}/>
              </div>
              {/* bailleur conditionnel */}
              <div style={{background:T.grey1,borderRadius:9,padding:"8px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:9,color:T.textLight,fontWeight:700,letterSpacing:.5,marginBottom:2}}>{bail.typeGestion==="agreee"?"AGENCE":"BAILLEUR"}</div>
                    <div style={{fontSize:11,fontWeight:700,color:T.textMid}}>{bail.typeGestion==="agreee"?bail.agence:BAILLEUR.val}</div>
                  </div>
                  {bail.typeGestion==="agreee"&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:9,color:T.textLight,fontWeight:700,marginBottom:2}}>RÉF. BAILLEUR</div>
                      <div style={{fontSize:11,fontWeight:700,color:T.grey3}}>{BAILLEUR.val}</div>
                    </div>
                  )}
                </div>
                <div style={{fontSize:9,color:T.textLight,marginTop:5,fontStyle:"italic"}}>🔐 {BAILLEUR.mention}</div>
              </div>
            </div>
          </div>
          {/* aperçu quittance */}
          {(()=>{const q=quittances.find(x=>x.statut==="Certifiée");return q&&(
            <div style={{padding:"12px 16px 0"}}>
              <SecTitle label="Dernière quittance" right={<button onClick={()=>go("quitt")} style={{background:"none",border:"none",fontSize:10,fontWeight:700,color:T.teal,cursor:"pointer"}}>Tout voir →</button>}/>
              <div onClick={()=>{go("quitt");setQSel(q);}} style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderLeft:`4px solid ${T.green}`,borderRadius:12,padding:"10px 12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{q.mois} — {fmt(q.montant)} FCFA</div><div style={{fontSize:9,color:T.textLight,marginTop:1,fontFamily:"monospace"}}>{q.ref}</div></div>
                  <Badge label="✓ Certifiée" color={T.green} bg={T.white}/>
                </div>
              </div>
            </div>
          );})()}
          {/* aperçu CIE/SODECI */}
          <div style={{padding:"12px 16px 0"}}>
            <SecTitle label="⚡ CIE / SODECI" right={<button onClick={()=>go("util")} style={{background:"none",border:"none",fontSize:10,fontWeight:700,color:T.orange,cursor:"pointer"}}>Voir →</button>}/>
            <div style={{display:"flex",gap:7}}>
              {abos.map(a=>(
                <div key={a.id} onClick={()=>{go("util");setASel(a);}} style={{flex:1,background:a.bg,border:`1px solid ${a.color}20`,borderRadius:12,padding:"10px",cursor:"pointer"}}>
                  <div style={{fontSize:18,marginBottom:2}}>{a.icon}</div>
                  <div style={{fontSize:10,fontWeight:700,color:a.color}}>{a.type}</div>
                  <div style={{fontSize:13,fontWeight:900,color:T.text,fontFamily:"monospace"}}>{fmt(a.montant)}</div>
                  <div style={{fontSize:8,color:T.textLight}}>FCFA · {a.mois}</div>
                  <div style={{marginTop:4}}><Badge label={a.statut} color={T.green} bg={T.greenPale} size={8}/></div>
                </div>
              ))}
            </div>
          </div>
          {/* accès rapides */}
          <div style={{padding:"12px 16px 0"}}>
            <SecTitle label="⚡ Accès rapides"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[
                {icon:"📤",label:"Export certifié",sub:"36 mois · banque",color:T.navy,bg:T.navyPale,act:()=>op("export")},
                {icon:"⚖️",label:"Mes droits",sub:"Réclamation · Préavis",color:T.purple,bg:T.purplePale,act:()=>go("droits")},
                {icon:"🔒",label:"Ma caution",sub:"Statut CDC",color:T.teal,bg:T.tealPale,act:()=>op("caution")},
                {icon:"📲",label:"USSD",sub:"*144*QAPRIL#",color:T.green,bg:T.greenPale,act:()=>op("ussd")},
              ].map((a,i)=>(
                <div key={i} onClick={a.act} style={{background:a.bg,border:`1px solid ${a.color}18`,borderRadius:12,padding:"10px 11px",cursor:"pointer"}}>
                  <div style={{fontSize:18,marginBottom:3}}>{a.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:a.color}}>{a.label}</div>
                  <div style={{fontSize:9,color:T.textLight,marginTop:1}}>{a.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ MON BAIL ══ */}
      {tab==="bail"&&(
        <div style={{padding:"12px 16px 0"}}>
          <div style={{background:`linear-gradient(135deg,${T.navy}08,${T.teal}08)`,border:`1px solid ${T.navy}15`,borderRadius:14,padding:13,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>{bail.logement}</div>
            <div style={{fontSize:10,color:T.textLight,marginBottom:8}}>{bail.adresse}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              <Badge label={bail.type} color={bail.type==="BDQ"?T.green:T.navy} bg={bail.type==="BDQ"?T.greenPale:T.navyPale}/>
              <Badge label={bail.ref} color={T.textLight} bg={T.grey1} size={9}/>
              {bail.statut==="Impayé"?<Badge label={`J+${bail.retard}`} color={T.white} bg={T.red}/>:<Badge label="À jour" color={T.green} bg={T.greenPale}/>}
            </div>
            <div style={{display:"flex",gap:8}}>
              {[{l:"Loyer",v:fmt(bail.loyer)+" FCFA"},{l:"Début",v:bail.debut},{l:"Fin",v:bail.fin}].map((k,i)=>(
                <div key={i} style={{flex:1,background:T.white,borderRadius:9,padding:"6px 5px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:T.textLight,marginBottom:2}}>{k.l}</div>
                  <div style={{fontSize:10,fontWeight:800,color:T.textMid}}>{k.v}</div>
                </div>
              ))}
            </div>
          </div>
          <Row label="Référence" value={bail.ref}/>
          <Row label="Type de bail" value={bail.type} color={bail.type==="BDQ"?T.green:T.navy}/>
          <Row label="Loyer mensuel" value={fmt(bail.loyer)+" FCFA"} color={T.navy}/>
          <Row label="Échéance" value={`Le ${bail.echeanceJour}er de chaque mois`}/>
          <Row label="Fin de bail" value={bail.fin}/>
          {/* bloc bailleur */}
          <div style={{marginTop:10,background:T.grey1,borderRadius:12,padding:"11px 12px",marginBottom:10}}>
            <SecTitle label="Bailleur & Gestion"/>
            {bail.typeGestion==="agreee"?(
              <>
                <Row label="Agence gestionnaire" value={bail.agence} color={T.teal}/>
                <Row label="Réf. bailleur" value={BAILLEUR.val} color={T.grey3}/>
                <div style={{marginTop:8,background:T.navyPale,borderRadius:9,padding:"7px 10px",fontSize:9,color:T.textMid}}>
                  🔐 Agence agréée — substitution totale exclusive. Votre interlocuteur est uniquement l'agence.
                </div>
              </>
            ):!BAILLEUR.masque?(
              <>
                <Row label="Propriétaire" value={BAILLEUR.val} color={T.navy}/>
                {bail.agence&&<Row label="Intermédiaire" value={bail.agence}/>}
                <div style={{marginTop:8,background:T.greenPale,borderRadius:9,padding:"7px 10px",fontSize:9,color:T.textMid}}>👤 {BAILLEUR.mention}</div>
              </>
            ):(
              <>
                <Row label="Réf. bailleur" value={BAILLEUR.val} color={T.grey3}/>
                {bail.agence&&<Row label="Intermédiaire" value={bail.agence}/>}
                <div style={{marginTop:8,background:T.navyPale,borderRadius:9,padding:"7px 10px",fontSize:9,color:T.textMid}}>🔐 {BAILLEUR.mention}</div>
              </>
            )}
          </div>
          {/* SHA */}
          <div style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:11,padding:"9px 12px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:3}}>✓ Certification SHA-256</div>
            <div style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>{bail.sha}</div>
          </div>
          <SecTitle label="Actions"/>
          <ACard icon="📄" label="Télécharger mon bail PDF" sub="SHA-256 · archivé dans votre espace" color={T.navy} bg={T.navyPale} onClick={()=>{}}/>
          <ACard icon="🚪" label="Initier un préavis de sortie" sub="Délai légal 1 mois CI · formalisé QAPRIL" color={T.orange} bg={T.orangePale} onClick={()=>{go("droits");setDsec("preavis");}}/>
          <ACard icon="⚠️" label="Contester une modification de loyer" sub="Règle MRL-01 — votre consentement est obligatoire" color={T.red} bg={T.redPale} onClick={()=>{go("droits");setDsec("mrl");}}/>
        </div>
      )}

      {/* ══ QUITTANCES ══ */}
      {tab==="quitt"&&!qSel&&(
        <div style={{padding:"12px 16px 0"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {[{l:"Certifiées",v:quittances.filter(q=>q.statut==="Certifiée").length,c:T.green,bg:T.greenPale},{l:"Impayées",v:quittances.filter(q=>q.statut==="Impayée").length,c:T.red,bg:T.redPale},{l:"Total",v:fmt(quittances.filter(q=>q.statut==="Certifiée").reduce((s,q)=>s+q.montant,0)/1000)+"K",c:T.navy,bg:T.navyPale}].map((k,i)=>(
              <div key={i} style={{flex:1,background:k.bg,borderRadius:12,padding:"10px 8px",textAlign:"center",border:`1px solid ${k.c}20`}}>
                <div style={{fontSize:18,fontWeight:900,color:k.c}}>{k.v}</div>
                <div style={{fontSize:9,color:T.textLight,marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
          <div style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:10,fontWeight:700,color:T.green}}>🔐 SHA-256 · QR Code · Opposables juridiquement</div>
          {quittances.map((q,i)=>(
            <div key={i} onClick={()=>setQSel(q)} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${q.statut==="Certifiée"?T.green:T.red}`,borderRadius:12,padding:"10px 12px",marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{q.mois} — {fmt(q.montant)} FCFA</div><div style={{fontSize:9,color:T.textLight,marginTop:1,fontFamily:"monospace"}}>{q.ref} · {q.date}</div></div>
                <Badge label={q.statut} color={q.statut==="Certifiée"?T.green:T.red} bg={q.statut==="Certifiée"?T.greenPale:T.redPale}/>
              </div>
            </div>
          ))}
          <button onClick={()=>op("export")} style={{width:"100%",background:T.navyPale,border:`1px solid ${T.navy}20`,borderRadius:11,padding:"10px",fontSize:11,fontWeight:700,color:T.navy,cursor:"pointer",marginTop:4}}>📤 Exporter l'historique certifié (36 mois)</button>
        </div>
      )}
      {tab==="quitt"&&qSel&&(
        <div>
          <div style={{padding:"10px 16px 0"}}><BackBtn label="Quittances" onClick={()=>setQSel(null)}/></div>
          <div style={{margin:"0 16px 10px",padding:14,background:qSel.statut==="Certifiée"?T.greenPale:T.redPale,borderRadius:14,border:`1px solid ${qSel.statut==="Certifiée"?T.green:T.red}20`}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div><div style={{fontSize:13,fontWeight:800,color:T.text}}>{qSel.mois}</div><div style={{fontSize:10,color:T.textLight,marginTop:2,fontFamily:"monospace"}}>{qSel.ref}</div><div style={{fontSize:10,color:T.textLight}}>{qSel.date}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:900,color:qSel.statut==="Certifiée"?T.green:T.red,fontFamily:"monospace"}}>{fmt(qSel.montant)}</div><div style={{fontSize:9,color:T.textLight}}>FCFA</div><div style={{marginTop:4}}><Badge label={qSel.statut} color={qSel.statut==="Certifiée"?T.green:T.red} bg={T.white}/></div></div>
            </div>
          </div>
          {qSel.sha&&(
            <div style={{margin:"0 16px 10px",background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:11,padding:"10px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:3}}>✓ Certification SHA-256</div>
              <div style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>{qSel.sha}</div>
              <div style={{marginTop:8,display:"flex",justifyContent:"center"}}><div style={{width:60,height:60,background:T.white,border:`1px solid ${T.green}30`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📱</div></div>
              <div style={{fontSize:9,color:T.textLight,textAlign:"center",marginTop:3}}>QR Code de vérification</div>
            </div>
          )}
          <div style={{padding:"0 16px"}}>
            {(qSel.statut==="Certifiée"?[
              {icon:"📄",label:"Télécharger le PDF",color:T.navy,bg:T.navyPale,act:undefined,sub:undefined},
              {icon:"💬",label:"Envoyer par WhatsApp",color:T.green,bg:T.greenPale,act:undefined,sub:undefined},
              {icon:"🔗",label:"Lien de vérification (30j)",color:T.teal,bg:T.tealPale,act:undefined,sub:undefined},
            ]:[
              {icon:"📸",label:"Soumettre ma preuve de paiement",sub:"Capture SMS Mobile Money ou reçu",color:T.navy,bg:T.navyPale,act:()=>{setQSel(null);go("droits");setDsec("rcl");setRclCode("RCL-02");}},
            ]).map((a: any,i: number)=><ACard key={i} icon={a.icon} label={a.label} sub={a.sub} color={a.color} bg={a.bg} onClick={a.act||undefined}/>)}
          </div>
        </div>
      )}

      {/* ══ CIE / SODECI ══ */}
      {tab==="util"&&!aSel&&(
        <div style={{padding:"12px 16px 0"}}>
          <div style={{background:T.orangePale,border:`1px solid ${T.orange}20`,borderRadius:11,padding:"9px 12px",marginBottom:12,fontSize:10,color:T.textMid}}>⚡ Suivi de vos abonnements CIE et SODECI liés à votre logement.</div>
          {abos.map(a=>(
            <div key={a.id} onClick={()=>setASel(a)} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${a.color}`,borderRadius:13,padding:"12px 13px",marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:11,background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{a.icon}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:T.text}}>{a.label}</div>
                    <div style={{fontSize:10,color:T.textLight,marginTop:1}}>N° {a.compteur}</div>
                    <div style={{display:"flex",gap:5,marginTop:4}}>
                      <Badge label={a.statut} color={T.green} bg={T.greenPale}/>
                      <Badge label={a.mois} color={T.textLight} bg={T.grey1}/>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:900,color:a.color,fontFamily:"monospace"}}>{fmt(a.montant)}</div>
                  <div style={{fontSize:9,color:T.textLight}}>FCFA</div>
                </div>
              </div>
              {/* mini graphe */}
              <div style={{display:"flex",gap:3,alignItems:"flex-end",height:24,marginTop:10}}>
                {a.hist.map((v,i)=>{
                  const max=Math.max(...(a.hist.filter(v=>v!==null) as number[]));
                  return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",background:v?a.color+"70":T.grey2,borderRadius:"3px 3px 0 0",height:v?`${Math.round((v/max)*18)}px`:"4px"}}/><div style={{fontSize:7,color:T.textLight}}>{"NDJFM"[i]}</div></div>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="util"&&aSel&&(
        <div>
          <div style={{padding:"10px 16px 0"}}><BackBtn label="CIE / SODECI" onClick={()=>setASel(null)}/></div>
          <div style={{margin:"0 16px 10px",padding:13,background:aSel.bg,borderRadius:14,border:`1px solid ${aSel.color}20`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:46,height:46,borderRadius:12,background:T.white+"80",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{aSel.icon}</div>
              <div><div style={{fontSize:14,fontWeight:800,color:T.text}}>{aSel.label}</div><div style={{fontSize:10,color:T.textLight}}>N° {aSel.compteur}</div></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              {[{l:"Dernière facture",v:fmt(aSel.montant)+" FCFA"},{l:"Statut",v:aSel.statut},{l:"Mode",v:aSel.mode}].map((k,i)=>(
                <div key={i} style={{flex:1,background:T.white+"CC",borderRadius:9,padding:"6px 5px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:T.textLight,marginBottom:1}}>{k.l}</div>
                  <div style={{fontSize:10,fontWeight:800,color:T.textMid}}>{k.v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* graphe barres */}
          <div style={{margin:"0 16px 10px",background:T.grey1,borderRadius:12,padding:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMid,marginBottom:8}}>Historique consommation</div>
            <div style={{display:"flex",gap:5,alignItems:"flex-end",height:60}}>
              {aSel.hist.map((v,i)=>{
                const max=Math.max(...(aSel.hist.filter(v=>v!==null) as number[]));
                return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  {v&&<div style={{fontSize:7,color:aSel.color,fontWeight:700}}>{v}K</div>}
                  <div style={{width:"100%",background:v?aSel.color:T.grey2,borderRadius:"4px 4px 0 0",height:v?`${Math.round((v/max)*38)}px`:"6px"}}/>
                  <div style={{fontSize:8,color:T.textLight}}>{"NDJFM"[i]}</div>
                </div>
                );
              })}
            </div>
          </div>
          <div style={{padding:"0 16px"}}>
            {[
              {icon:"📄",label:"Télécharger la dernière facture",color:aSel.color,bg:aSel.bg},
              {icon:"📲",label:"Payer en ligne",sub:`Orange Money · Wave · MTN`,color:T.green,bg:T.greenPale},
              {icon:"🔔",label:"Activer les rappels de facture",sub:"SMS + WhatsApp avant la date de relevé",color:T.navy,bg:T.navyPale},
              {icon:"📊",label:"Exporter l'historique 12 mois",color:T.purple,bg:T.purplePale},
            ].map((a,i)=><ACard key={i} icon={a.icon} label={a.label} sub={a.sub} color={a.color} bg={a.bg} onClick={()=>{}}/>)}
          </div>
        </div>
      )}

      {/* ══ MES DROITS ══ */}
      {tab==="droits"&&!dsec&&!tSel&&(
        <div style={{padding:"12px 16px 0"}}>
          <div style={{background:T.purplePale,border:`1px solid ${T.purple}20`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:T.purple,marginBottom:3}}>⚖️ Vos droits locataires</div>
            <div style={{fontSize:10,color:T.textMid,lineHeight:1.6}}>Réclamations · Consentement loyer · Préavis · Export certifié</div>
          </div>
          {/* ticket actif */}
          {tickets.filter(t=>t.statut!=="Résolu").map(t=>(
            <div key={t.id}>
              <SecTitle label="Ticket en cours"/>
              <div style={{background:T.orangePale,border:`1.5px solid ${T.orange}30`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{display:"flex",gap:5,marginBottom:3}}><Badge label={t.code||''} color={T.purple} bg={T.purplePale} size={9}/><Badge label="En attente bailleur" color={T.orange} bg={T.white} size={9}/></div>
                    <div style={{fontSize:11,fontWeight:700,color:T.text}}>{t.label}</div>
                    <div style={{fontSize:9,color:T.textLight,marginTop:1}}>Soumis le {t.date} · {t.heures || 0}h restantes</div>
                  </div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:T.orange,fontFamily:"monospace"}}>{fmt(t.montant||0)}</div><div style={{fontSize:8,color:T.textLight}}>FCFA</div></div>
                </div>
                {/* barre progression délai */}
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.textLight,marginBottom:3}}>
                    <span>⏳ 144h</span><span style={{color:T.orange,fontWeight:700}}>{t.heures || 0}h restantes</span>
                  </div>
                  <div style={{height:5,background:T.grey1,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.round((1-(t.heures||0)/144)*100)}%`,background:`linear-gradient(90deg,${T.green},${T.orange})`,borderRadius:4}}/>
                  </div>
                  <div style={{fontSize:8,color:T.textLight,marginTop:2,textAlign:"right"}}>Clôture auto : {t.echeance}</div>
                </div>
                {/* mini timeline */}
                {(t.timeline||[]).map((tl,i,arr)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:tl.c}}/>
                      {i<arr.length-1&&<div style={{width:1.5,flex:1,background:T.grey2,minHeight:10}}/>}
                    </div>
                    <div><div style={{fontSize:8,color:T.textLight}}>{tl.h}</div><div style={{display:"flex",gap:4,alignItems:"center",marginTop:1}}><span style={{fontSize:11}}>{tl.icon}</span><span style={{fontSize:9,color:T.textMid}}>{tl.evt}</span></div></div>
                  </div>
                ))}
                <div style={{background:T.white,borderRadius:8,padding:"6px 9px",marginTop:6,fontSize:9,color:T.textMid,fontStyle:"italic",lineHeight:1.5}}>
                  ⚡ Sans réponse du bailleur à 144h, ticket fermé en votre faveur. Bailleur : <strong>−2 pts QAPRIL</strong>. Notif. SMS + WhatsApp.
                </div>
              </div>
            </div>
          ))}
          {/* ticket résolu */}
          <SecTitle label="Tickets résolus"/>
          {tickets.filter(t=>t.statut==="Résolu").map(t=>(
            <div key={t.id} onClick={()=>setTSel(t)} style={{background:T.white,border:`1px solid ${T.grey2}`,borderLeft:`4px solid ${T.green}`,borderRadius:12,padding:"10px 12px",marginBottom:12,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{display:"flex",gap:5,marginBottom:3}}><Badge label={t.code||''} color={T.purple} bg={T.purplePale} size={9}/><Badge label={t.statut||''} color={T.green} bg={T.greenPale} size={9}/></div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{t.label}</div><div style={{fontSize:9,color:T.textLight,marginTop:1}}>{t.date||''}</div></div>
                <span style={{fontSize:14,color:T.textLight}}>›</span>
              </div>
            </div>
          ))}
          {/* actions */}
          <SecTitle label="Actions"/>
          <ACard icon="📋" label="Soumettre une réclamation" sub="Quittance · Paiement · Charges · Harcèlement — 144h délai bailleur" color={T.purple} bg={T.purplePale} onClick={()=>setDsec("rcl")}/>
          <ACard icon="✏️" label="Consentement modification loyer" sub="Règle MRL-01 — répondre à une demande du bailleur" color={T.orange} bg={T.orangePale} onClick={()=>setDsec("mrl")}/>
          <ACard icon="🚪" label="Initier un préavis de sortie" sub="Délai légal 1 mois CI · formalisation QAPRIL" color={T.navy} bg={T.navyPale} onClick={()=>setDsec("preavis")}/>
          <ACard icon="📤" label="Export certifié 36 mois" sub="PDF SHA-256 · banque · inclusion financière" color={T.green} bg={T.greenPale} onClick={()=>op("export")}/>
        </div>
      )}

      {/* ── Fiche ticket ── */}
      {tab==="droits"&&tSel&&!dsec&&(
        <div>
          <div style={{padding:"10px 16px 0"}}><BackBtn label="Mes droits" onClick={()=>setTSel(null)}/></div>
          <div style={{margin:"0 16px 10px",background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:13,padding:"12px 13px"}}>
            <div style={{display:"flex",gap:5,marginBottom:5}}><Badge label={tSel.code||''} color={T.purple} bg={T.purplePale}/><Badge label={tSel.statut||''} color={tSel.color||T.green} bg={(tSel.color||T.green)+"15"}/></div>
            <div style={{fontSize:13,fontWeight:800,color:T.text}}>{tSel.label}</div>
            <div style={{fontSize:10,color:T.textLight,marginTop:2}}>{tSel.date||''} · Délai bailleur : {tSel.delai||''}</div>
          </div>
          <div style={{padding:"0 16px"}}>
            <Row label="Ticket N°" value={tSel.id}/>
            <Row label="Montant concerné" value={fmt(tSel.montant||0)+" FCFA"}/>
            <Row label="Résolution" value={tSel.resolution||''} color={T.green}/>
          </div>
          <div style={{padding:"10px 16px 0"}}>
            <SecTitle label="Historique"/>
            {(tSel.timeline||[]).map((t,i,arr)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:14,marginTop:2}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:t.c}}/>
                  {i<arr.length-1&&<div style={{width:1.5,flex:1,background:T.grey2,minHeight:16}}/>}
                </div>
                <div style={{paddingBottom:6}}>
                  <div style={{fontSize:9,color:T.textLight}}>{t.h}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginTop:1}}><span style={{fontSize:12}}>{t.icon}</span><span style={{fontSize:10,color:T.textMid}}>{t.evt}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RCL — choix type ── */}
      {tab==="droits"&&dsec==="rcl"&&!rclCode&&(
        <div style={{padding:"10px 16px 0"}}>
          <BackBtn label="Mes droits" onClick={()=>setDsec(null)}/>
          <div style={{fontSize:11,color:T.textMid,marginBottom:12,lineHeight:1.6}}>Choisissez le type de réclamation. Délai de réponse bailleur : <strong>144h</strong>. Sans réponse : ticket fermé en votre faveur, <strong>−2 pts bailleur</strong>.</div>
          {RCL.map((r,i)=>(
            <div key={i} onClick={()=>setRclCode(r.code)} style={{background:T.purplePale,border:`1.5px solid ${T.purple}20`,borderRadius:12,padding:"12px 13px",marginBottom:9,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:22}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:5,marginBottom:3}}><Badge label={r.code} color={T.purple} bg={T.white} size={9}/><Badge label="144h" color={T.textLight} bg={T.grey1} size={9}/></div>
                <div style={{fontSize:12,fontWeight:700,color:T.purple}}>{r.label}</div>
                <div style={{fontSize:10,color:T.textLight,marginTop:1}}>{r.sub}</div>
              </div>
              <span style={{fontSize:14,color:T.purple,opacity:.5}}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* ── RCL — formulaire ── */}
      {tab==="droits"&&dsec==="rcl"&&rclCode&&!rclSent&&(
        <div style={{padding:"10px 16px 0"}}>
          <BackBtn label="Réclamations" onClick={()=>setRclCode(null)}/>
          <div style={{background:T.purplePale,border:`1px solid ${T.purple}20`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
            <div style={{display:"flex",gap:5,marginBottom:4}}><Badge label={rclCode} color={T.purple} bg={T.white} size={9}/><Badge label="144h délai bailleur" color={T.textLight} bg={T.grey1} size={9}/></div>
            <div style={{fontSize:12,fontWeight:800,color:T.purple}}>{RCL.find(r=>r.code===rclCode)?.label}</div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMid,marginBottom:4}}>Description <span style={{color:T.red}}>*</span></div>
            <textarea readOnly placeholder="Décrivez votre situation…" style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.grey2}`,borderRadius:10,padding:"10px 12px",fontSize:11,color:T.textLight,background:T.grey1,outline:"none",resize:"none",height:80}}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMid,marginBottom:4}}>Justificatif</div>
            <div style={{border:`2px dashed ${T.purple}`,borderRadius:10,padding:"14px",textAlign:"center",background:T.purplePale,cursor:"pointer"}}>
              <div style={{fontSize:20,marginBottom:3}}>📎</div>
              <div style={{fontSize:11,fontWeight:700,color:T.purple}}>Joindre une capture d'écran</div>
              <div style={{fontSize:9,color:T.textLight,marginTop:2}}>SMS Mobile Money · Reçu · Photo</div>
            </div>
          </div>
          {/* ── Bloc spécifique Travaux RCL-05 ── */}
          {rclCode==="RCL-05"&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:T.textMid,marginBottom:6}}>Type de travaux <span style={{color:T.red}}>*</span></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {RCL.find(r=>r.code==="RCL-05")?.types?.map((t,i)=>(
                  <div key={i} onClick={()=>setTravauxType(t)} style={{background:travauxType===t?T.orange:T.grey1,border:`1.5px solid ${travauxType===t?T.orange:T.grey2}`,borderRadius:8,padding:"5px 10px",fontSize:10,fontWeight:700,color:travauxType===t?T.white:T.textMid,cursor:"pointer"}}>
                    {t}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,background:T.redPale,border:`1px solid ${T.red}20`,borderRadius:10,padding:"9px 12px",cursor:"pointer"}} onClick={()=>setTravauxUrgent(u=>!u)}>
                <div style={{width:20,height:20,borderRadius:5,background:travauxUrgent?T.red:T.white,border:`2px solid ${T.red}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {travauxUrgent&&<span style={{fontSize:12,color:T.white}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.red}}>⚠ Urgence — risque pour la sécurité</div>
                  <div style={{fontSize:9,color:T.textLight,marginTop:1}}>Fuite active · Électricité dangereuse · Insalubrité grave — traitement prioritaire</div>
                </div>
              </div>
            </div>
          )}
          <div style={{background:T.navyPale,borderRadius:10,padding:"9px 12px",marginBottom:12,fontSize:10,color:T.textMid,lineHeight:1.6}}>
            🔐 QAPRIL notifie le bailleur sans révéler votre identité dans un premier temps. Délai : <strong>144h</strong>. Sans réponse → ticket fermé en votre faveur, <strong>−2 pts bailleur</strong>. Notifications : <strong>SMS + WhatsApp</strong>.
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setRclCode(null)} style={{flex:1,background:T.grey1,border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>Annuler</button>
            <button onClick={()=>setRclSent(true)} disabled={rclCode==="RCL-05"&&!travauxType} style={{flex:2,background:rclCode==="RCL-05"&&!travauxType?T.grey2:T.purple,border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:800,color:rclCode==="RCL-05"&&!travauxType?T.grey3:T.white,cursor:rclCode==="RCL-05"&&!travauxType?"not-allowed":"pointer"}}>Soumettre →</button>
          </div>
        </div>
      )}

      {/* ── RCL — confirmation ── */}
      {tab==="droits"&&dsec==="rcl"&&rclSent&&(
        <div style={{padding:"10px 16px 0",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:10,marginTop:20}}>✅</div>
          <div style={{fontSize:15,fontWeight:800,color:T.navy,marginBottom:6}}>Réclamation soumise</div>
          <div style={{fontSize:11,color:T.textMid,lineHeight:1.7,marginBottom:12}}>Bailleur notifié. Délai de réponse : <strong>144h</strong>. Notifications <strong>SMS + WhatsApp</strong> à chaque étape.</div>
          <div style={{background:T.purplePale,border:`1px solid ${T.purple}20`,borderRadius:12,padding:12,marginBottom:12,textAlign:"left"}}>
            <Row label="Type" value={rclCode} color={T.purple}/>
            {rclCode==="RCL-05"&&travauxType&&<Row label="Travaux" value={travauxType} color={T.orange}/>}
            {rclCode==="RCL-05"&&travauxUrgent&&<Row label="Urgence" value="⚠ Prioritaire — risque sécurité" color={T.red}/>}
            <Row label="Statut" value="En attente bailleur" color={T.orange}/>
            <Row label="Délai bailleur" value="144h (6 jours)"/>
            <Row label="Clôture auto si silence" value="En votre faveur"/>
          </div>
          <div style={{background:T.orangePale,border:`1px solid ${T.orange}20`,borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:10,color:T.textMid,lineHeight:1.6,textAlign:"left"}}>
            ⚡ <strong>Clôture automatique :</strong> Sans réponse à 144h, ticket fermé en votre faveur. Le bailleur se verra retirer <strong>−2 points</strong> de son score QAPRIL.
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {["📲 SMS","💬 WhatsApp","🔔 App QAPRIL"].map((c,i)=>(
              <div key={i} style={{flex:1,background:T.navyPale,border:`1px solid ${T.navy}20`,borderRadius:8,padding:"5px",textAlign:"center",fontSize:9,fontWeight:700,color:T.navy}}>{c}</div>
            ))}
          </div>
          <button onClick={()=>{setRclSent(false);setRclCode(null);setDsec(null);}} style={{background:T.navy,border:"none",borderRadius:12,padding:"11px 24px",fontSize:12,fontWeight:700,color:T.white,cursor:"pointer"}}>Retour à mes droits</button>
        </div>
      )}

      {/* ── MRL ── */}
      {tab==="droits"&&dsec==="mrl"&&(
        <div style={{padding:"10px 16px 0"}}>
          <BackBtn label="Mes droits" onClick={()=>setDsec(null)}/>
          <div style={{background:T.orangePale,border:`1px solid ${T.orange}20`,borderRadius:12,padding:"12px 13px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:T.orange,marginBottom:4}}>✏️ Demande de modification de loyer</div>
            <div style={{fontSize:10,color:T.textMid,lineHeight:1.6}}>Règle MRL-01 — votre consentement est obligatoire. Vous disposez de <strong>5 jours</strong> pour répondre.</div>
          </div>
          <Row label="Loyer actuel" value={fmt(bail.loyer)+" FCFA / mois"}/>
          <Row label="Nouveau loyer proposé" value={fmt(165000)+" FCFA / mois"} color={T.orange}/>
          <Row label="Hausse" value="+15 000 FCFA (+10%)" color={T.red}/>
          <Row label="Date d'effet proposée" value="01/06/2026"/>
          <Row label="Délai de réponse" value="5 jours — avant le 01/04/2026"/>
          {!mrlChoice?(
            <div style={{marginTop:14}}>
              <div style={{background:T.navyPale,borderRadius:10,padding:"9px 12px",marginBottom:12,fontSize:10,color:T.textMid}}>Sans réponse dans les 5 jours, la modification est <strong>suspendue</strong> automatiquement. Vous serez notifié par SMS + WhatsApp.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setMrlChoice("non")} style={{flex:1,background:T.redPale,border:`1px solid ${T.red}30`,borderRadius:10,padding:"12px",fontSize:12,fontWeight:800,color:T.red,cursor:"pointer"}}>✕ Refuser</button>
                <button onClick={()=>setMrlChoice("oui")} style={{flex:1,background:T.green,border:"none",borderRadius:10,padding:"12px",fontSize:12,fontWeight:800,color:T.white,cursor:"pointer"}}>✓ Accepter</button>
              </div>
            </div>
          ):(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:36,marginBottom:8}}>{mrlChoice==="oui"?"✅":"❌"}</div>
              <div style={{fontSize:14,fontWeight:800,color:mrlChoice==="oui"?T.green:T.red,marginBottom:8}}>{mrlChoice==="oui"?"Modification acceptée":"Modification refusée"}</div>
              <div style={{fontSize:11,color:T.textMid,lineHeight:1.7,marginBottom:16}}>
                {mrlChoice==="oui"?"Votre accord a été enregistré. Le nouveau loyer de 165 000 FCFA sera effectif le 01/06/2026.":"Votre refus a été enregistré. Votre loyer reste à 150 000 FCFA. Ticket de médiation ouvert."}
              </div>
              <button onClick={()=>{setMrlChoice(null);setDsec(null);}} style={{background:T.navy,border:"none",borderRadius:12,padding:"10px 20px",fontSize:11,fontWeight:700,color:T.white,cursor:"pointer"}}>Retour à mes droits</button>
            </div>
          )}
        </div>
      )}

      {/* ── PRÉAVIS ── */}
      {tab==="droits"&&dsec==="preavis"&&(
        <div style={{padding:"10px 16px 0"}}>
          <BackBtn label="Mes droits" onClick={()=>{setDsec(null);setPrStep(1);}}/>
          <div style={{background:T.navyPale,border:`1px solid ${T.navy}20`,borderRadius:12,padding:"12px 13px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:4}}>🚪 Préavis de sortie</div>
            <div style={{fontSize:10,color:T.textMid,lineHeight:1.6}}>Délai légal <strong>1 mois</strong> (30 jours). QAPRIL génère l'Avis de Départ daté et signé électroniquement.</div>
          </div>
          {/* barre progression */}
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:4,background:s<=prStep?T.navy:T.grey2}}/>)}
          </div>
          {prStep===1&&(
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.textMid,marginBottom:10}}>Étape 1 — Date de départ souhaitée</div>
              <input readOnly placeholder="Ex : 01/05/2026" style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.grey2}`,borderRadius:10,padding:"10px 12px",fontSize:12,background:T.grey1,outline:"none",marginBottom:10}}/>
              <div style={{background:T.goldPale,border:`1px solid ${T.gold}30`,borderRadius:10,padding:"9px 12px",marginBottom:12,fontSize:10,color:T.textMid}}>📅 Préavis déposé le 01/04 → départ au plus tôt le <strong>01/05/2026</strong>.</div>
              <button onClick={()=>setPrStep(2)} style={{width:"100%",background:T.navy,border:"none",borderRadius:10,padding:"11px",fontSize:11,fontWeight:800,color:T.white,cursor:"pointer"}}>Valider la date →</button>
            </div>
          )}
          {prStep===2&&(
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.textMid,marginBottom:10}}>Étape 2 — Planifier l'état des lieux de sortie</div>
              {["Lun 28 avril — 9h à 11h","Mar 29 avril — 14h à 16h","Mer 30 avril — 9h à 11h"].map((c,i)=>(
                <div key={i} onClick={()=>setPrStep(3)} style={{background:T.navyPale,border:`1px solid ${T.navy}20`,borderRadius:11,padding:"10px 13px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:T.navy}}>{c}</span>
                  <span style={{fontSize:14,color:T.navy,opacity:.5}}>›</span>
                </div>
              ))}
            </div>
          )}
          {prStep===3&&(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:36,marginBottom:8}}>✅</div>
              <div style={{fontSize:14,fontWeight:800,color:T.navy,marginBottom:6}}>Préavis enregistré</div>
              <div style={{fontSize:11,color:T.textMid,marginBottom:14}}>Bailleur et agence notifiés par SMS + WhatsApp. Avis de Départ signé électroniquement.</div>
              <div style={{background:T.navyPale,borderRadius:12,padding:12,marginBottom:14,textAlign:"left"}}>
                <Row label="Date de départ" value="01/05/2026" color={T.navy}/>
                <Row label="EDL de sortie" value="Lun 28/04 — 9h-11h"/>
                <Row label="Restitution caution" value="≤ 7 jours après EDL"/>
              </div>
              <button onClick={()=>{setDsec(null);setPrStep(1);}} style={{background:T.navy,border:"none",borderRadius:12,padding:"10px 20px",fontSize:11,fontWeight:700,color:T.white,cursor:"pointer"}}>Retour à mes droits</button>
            </div>
          )}
        </div>
      )}

      {/* ══ PROFIL & EXPORT ══ */}
      {tab==="profil"&&(
        <div style={{padding:"12px 16px 0"}}>
          {/* avatar */}
          <div style={{background:`linear-gradient(135deg,${T.navy},${T.teal})`,borderRadius:14,padding:14,marginBottom:12,textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:T.white+"20",border:`2px solid ${T.white}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 8px"}}>👤</div>
            <div style={{fontSize:15,fontWeight:800,color:T.white}}>{loc.nom}</div>
            <div style={{fontSize:11,color:T.white,opacity:.7}}>{loc.tel}</div>
            <div style={{marginTop:8,display:"flex",justifyContent:"center",gap:6}}>
              <Badge label="KYC Validé" color={T.white} bg={T.green}/>
              <Badge label="Locataire actif" color={T.white} bg={T.teal}/>
            </div>
          </div>
          {/* score ICL */}
          <div onClick={()=>op("score")} style={{background:scColor+"10",border:`1.5px solid ${scColor}25`,borderRadius:13,padding:"12px 13px",marginBottom:12,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:T.textLight,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Mon score ICL</div>
                <div style={{fontSize:30,fontWeight:900,color:scColor,fontFamily:"monospace"}}>{sc}</div>
                <div style={{fontSize:10,color:scColor,fontWeight:700}}>Confiance {sc>=700?"satisfaisante":"modérée"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:T.textLight,marginBottom:4}}>Départ : {loc.scoreBase} · KYC : {loc.scoreKyc}</div>
                <div style={{width:60,height:60,borderRadius:"50%",border:`4px solid ${scColor}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:11,fontWeight:800,color:scColor}}>{Math.round((sc-300)/700*100)}%</span>
                </div>
              </div>
            </div>
            <div style={{height:5,background:T.grey1,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.round((sc-300)/700*100)}%`,background:`linear-gradient(90deg,${T.red},${T.orange},${T.green})`,borderRadius:4}}/>
            </div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {[{l:"Inscrit",v:loc.scoreBase,c:T.navy},{l:"KYC ✓",v:loc.scoreKyc,c:T.teal},{l:"Actuel",v:sc,c:scColor}].map((j,i)=>(
                <div key={i} style={{flex:1,background:j.c+"12",border:`1px solid ${j.c}25`,borderRadius:7,padding:"4px 5px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:T.textLight}}>{j.l}</div>
                  <div style={{fontSize:11,fontWeight:900,color:j.c,fontFamily:"monospace"}}>{j.v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,background:T.navyPale,borderRadius:7,padding:"5px 8px",fontSize:9,color:T.textMid}}>
              💡 Score départ <strong>750</strong> · KYC complet → <strong>800</strong> · +2 pts/loyer à temps · <strong>−10 pts</strong> si retard
            </div>
            <div style={{marginTop:4,fontSize:9,color:T.textLight,fontStyle:"italic"}}>🔐 Visible librement · Partageable sur votre autorisation — Règle ICL-CONSENT-01</div>
          </div>
          {/* export certifié */}
          <div style={{background:T.navyPale,border:`1px solid ${T.navy}20`,borderRadius:13,padding:"12px 13px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,marginBottom:6}}>📤 Export certifié — Inclusion financière</div>
            {[
              {icon:"📄",label:"PDF certifié SHA-256 — 36 mois",sub:"Format banque · QR vérification",color:T.navy,bg:T.navyPale},
              {icon:"📊",label:"Export CSV",sub:"Format tableur",color:T.teal,bg:T.tealPale},
              {icon:"🔗",label:"Lien partageable (30j)",sub:"URL unique · lecture seule",color:T.green,bg:T.greenPale},
            ].map((e,i)=>(
              <div key={i} onClick={()=>op("export")} style={{display:"flex",alignItems:"center",gap:10,background:e.bg,border:`1px solid ${e.color}18`,borderRadius:10,padding:"9px 11px",marginBottom:7,cursor:"pointer"}}>
                <span style={{fontSize:18}}>{e.icon}</span>
                <div><div style={{fontSize:11,fontWeight:700,color:e.color}}>{e.label}</div><div style={{fontSize:9,color:T.textLight,marginTop:1}}>{e.sub}</div></div>
              </div>
            ))}
          </div>
          {/* KYC */}
          <SecTitle label="Documents KYC"/>
          {[{doc:"CNI ivoirienne",exp:"31/12/2027"},{doc:"Photo d'identité",exp:"—"}].map((d,i)=>(
            <div key={i} style={{background:T.white,border:`1px solid ${T.grey2}`,borderRadius:10,padding:"9px 12px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{d.doc}</div><div style={{fontSize:9,color:T.textLight}}>Exp. {d.exp}</div></div>
              <Badge label="✓ Validé" color={T.green} bg={T.greenPale}/>
            </div>
          ))}
          {/* USSD */}
          <div onClick={()=>op("ussd")} style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:12,padding:"11px 13px",cursor:"pointer",display:"flex",gap:10,alignItems:"center",marginTop:4}}>
            <span style={{fontSize:22}}>📲</span>
            <div><div style={{fontSize:12,fontWeight:700,color:T.green}}>Accès USSD — sans smartphone</div><div style={{fontSize:10,color:T.textLight}}>*144*QAPRIL# · Compatible tous téléphones</div></div>
          </div>
        </div>
      )}

    </div>{/* end body */}

    {/* ══ OVERLAYS ══ */}

    {/* Notifications */}
    <Sheet open={O.notifs} onClose={()=>cl("notifs")} title="🔔  Notifications">
      {[
        {icon:"🔴",t:`Loyer Mars 2026 — J+${bail.retard}`,s:`${fmt(bail.loyer)} FCFA · Ticket RCL-002 en cours`,bg:T.redPale},
        {icon:"🟢",t:"Quittance certifiée — Fév. 2026",s:`${fmt(bail.loyer)} FCFA · SHA-256 · SMS + WhatsApp envoyés`,bg:T.greenPale},
        {icon:"🟣",t:"Ticket TKT-001 résolu",s:"Bailleur a répondu dans les 144h · Quittance émise",bg:T.purplePale},
        {icon:"🔵",t:"Renouvellement bail dans 270 jours",s:`${bail.ref} · Fin : ${bail.fin}`,bg:T.navyPale},
      ].map((n,i)=>(
        <div key={i} style={{background:n.bg,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:14}}>{n.icon}</span><div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{n.t}</div><div style={{fontSize:10,color:T.textLight,marginTop:2}}>{n.s}</div></div></div>
        </div>
      ))}
    </Sheet>

    {/* Score ICL */}
    <Sheet open={O.score} onClose={()=>cl("score")} title="⭐  Mon score ICL">
      <div style={{background:scColor+"10",border:`1.5px solid ${scColor}25`,borderRadius:12,padding:12,marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:40,fontWeight:900,color:scColor,fontFamily:"monospace"}}>{sc}</div>
        <div style={{height:8,background:T.grey1,borderRadius:4,overflow:"hidden",marginTop:8,marginBottom:4}}>
          <div style={{height:"100%",width:`${Math.round((sc-300)/700*100)}%`,background:`linear-gradient(90deg,${T.red},${T.orange},${T.green})`,borderRadius:4}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.textLight}}><span>300</span><span>550</span><span>700</span><span>850</span><span>1000</span></div>
      </div>
      {/* règles */}
      <div style={{background:T.grey1,borderRadius:11,padding:"10px 12px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:800,color:T.textLight,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Règles de variation</div>
        {[
          {icon:"🎯",label:"Inscription QAPRIL",delta:"Score : 750",color:T.navy},
          {icon:"📋",label:"KYC complet (CNI + photo + justif. + OTP)",delta:"+50 pts → 800",color:T.teal},
          {icon:"✅",label:"Loyer payé à temps",delta:"+2 pts / mois",color:T.green},
          {icon:"⚠️",label:"Retard de paiement",delta:"−10 pts",color:T.red},
          {icon:"📋",label:"Ticket RCL non traité (bailleur silencieux)",delta:"−2 pts bailleur",color:T.textLight},
            {icon:"🔧",label:"Demande de travaux (RCL-05)",delta:"Bailleur : −2 pts si silence",color:T.textLight},
          {icon:"🏅",label:"24 mois sans retard consécutifs",delta:"+20 pts bonus",color:T.gold},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<5?`1px solid ${T.grey2}`:"none"}}>
            <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:12}}>{r.icon}</span><span style={{fontSize:10,color:T.textMid}}>{r.label}</span></div>
            <Badge label={r.delta} color={r.color} bg={r.color+"15"} size={9}/>
          </div>
        ))}
      </div>
      {/* évolution */}
      <SecTitle label="Évolution depuis l'inscription"/>
      {[
        {label:"Score initial (inscription)",pts:750,color:T.navy},
        {label:"KYC complété — +50 pts",pts:800,color:T.teal},
        {label:"Paiement Janv. 2026 — +2 pts",pts:802,color:T.green},
        {label:"Paiement Fév. 2026 — +2 pts",pts:804,color:T.green},
        {label:"Retard Mars 2026 J+12 — −10 pts",pts:794,color:T.red},
        {label:"Score actuel",pts:sc,color:scColor},
      ].map((h,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.grey1}`}}>
          <span style={{fontSize:10,color:T.textMid}}>{h.label}</span>
          <span style={{fontSize:12,fontWeight:800,color:h.color,fontFamily:"monospace"}}>{h.pts}</span>
        </div>
      ))}
      <div style={{marginTop:12,background:T.navyPale,borderRadius:10,padding:"9px 12px",fontSize:10,color:T.textMid}}>🔐 <strong>Votre score vous appartient.</strong> Partageable à des tiers uniquement sur votre autorisation. — Règle ICL-CONSENT-01</div>
    </Sheet>

    {/* Caution */}
    <Sheet open={O.caution} onClose={()=>cl("caution")} title="🔒  Ma caution CDC">
      <div style={{background:T.orangePale,border:`1px solid ${T.orange}20`,borderRadius:11,padding:"12px 13px",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:800,color:T.orange,marginBottom:4}}>Non consignée</div>
        <div style={{fontSize:11,color:T.textMid}}>Montant attendu : {fmt(300000)} FCFA</div>
      </div>
      <div style={{background:T.navyPale,borderRadius:10,padding:"10px 12px",fontSize:10,color:T.textMid,lineHeight:1.7}}>
        💡 <strong>Modèle CDC — 0 FCFA de frais.</strong> Si votre caution est consignée à la CDC-CI, vous récupérez 100% en fin de bail. Demandez à votre bailleur de procéder via QAPRIL.
      </div>
      <button onClick={()=>cl("caution")} style={{width:"100%",background:T.navy,border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:700,color:T.white,cursor:"pointer",marginTop:12}}>Fermer</button>
    </Sheet>

    {/* Export certifié */}
    <Sheet open={O.export} onClose={()=>cl("export")} title="📤  Export certifié">
      {[
        {icon:"📄",label:"PDF certifié SHA-256 — 36 mois",sub:"Format banque · QR de vérification · La Poste CI",color:T.navy,bg:T.navyPale},
        {icon:"📊",label:"Export CSV / Excel",sub:"Format tableur · données brutes",color:T.teal,bg:T.tealPale},
        {icon:"🔗",label:"Lien partageable (30j)",sub:"URL unique · lecture seule · non réutilisable",color:T.green,bg:T.greenPale},
      ].map((e,i)=>(
        <div key={i} onClick={()=>cl("export")} style={{display:"flex",alignItems:"center",gap:10,background:e.bg,border:`1px solid ${e.color}18`,borderRadius:11,padding:"11px 12px",marginBottom:8,cursor:"pointer"}}>
          <span style={{fontSize:20}}>{e.icon}</span>
          <div><div style={{fontSize:12,fontWeight:700,color:e.color}}>{e.label}</div><div style={{fontSize:9,color:T.textLight,marginTop:1}}>{e.sub}</div></div>
        </div>
      ))}
    </Sheet>

    {/* USSD */}
    <Sheet open={O.ussd} onClose={()=>cl("ussd")} title="📲  Accès USSD" tc={T.green}>
      <div style={{background:T.greenPale,border:`1px solid ${T.green}20`,borderRadius:11,padding:"12px 13px",marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:900,color:T.navy,letterSpacing:2,fontFamily:"monospace"}}>*144*QAPRIL#</div>
        <div style={{fontSize:10,color:T.textMid,marginTop:4}}>Compatible tous téléphones · Sans internet</div>
      </div>
      {["1. Consulter mes quittances (3 dernières)","2. Vérifier ma caution","3. Soumettre une réclamation","4. Historique paiements 12 mois (envoyé par SMS)","5. Demander export certifié (WhatsApp ou SMS)"].map((m,i)=>(
        <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.grey1}`}}>
          <span style={{fontSize:10,color:T.green,fontWeight:800,fontFamily:"monospace"}}>{i+1}.</span>
          <span style={{fontSize:10,color:T.textMid}}>{m.slice(3)}</span>
        </div>
      ))}
    </Sheet>

    {/* BOTTOM NAV */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.white,borderTop:`1px solid ${T.grey2}`,display:"flex",padding:"8px 0 14px",boxShadow:`0 -4px 20px ${T.navy}08`}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>go(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",padding:"4px 0",background:"none",border:"none"}}>
          <div style={{fontSize:17,filter:tab===t.id?"none":"grayscale(1) opacity(0.5)"}}>{t.icon}</div>
          <span style={{fontSize:8,fontWeight:700,color:tab===t.id?T.navy:T.textLight}}>{t.label}</span>
          {tab===t.id&&<div style={{width:16,height:2.5,background:T.navy,borderRadius:2}}/>}
        </button>
      ))}
    </div>

  </div>
  </div>
  );
}
