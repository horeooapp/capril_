// ═══════════════════════════════════════════════════════
// QAPRIL Design System - Tokens visuels approuves
// NE PAS MODIFIER - Valide par Soumahoro Frederic - 01/04/2026
// ═══════════════════════════════════════════════════════

// Palette couleurs - IMMUABLE
export const QAPRIL_COLORS = {
  navy:    "#1B3A6B",   // Couleur principale - header, boutons primaires
  amber:   "#F5A800",   // Accent - badges, highlights, wallet
  green:   "#007A4D",   // Succes - statuts payes, confirmations
  red:     "#CC2020",   // Erreur - alertes, impayés, urgence
  orange:  "#C05000",   // Montants FCFA
  blue:    "#1B5AAA",   // Info - liens, délégation
  bg:      "#EEF3FB",   // Fond de page
  border:  "#D0DFF5",   // Bordures cards
  light:   "#F0F5FF",   // Fond léger
  muted:   "#4A6A8A",   // Texte secondaire
  white:   "#FFFFFF",
} as const;

// Classes Tailwind correspondantes - UTILISER CES CLASSES
// Note: ajouter ces custom colors dans tailwind.config.ts
export const Q = {
  // Layout
  page:       "min-h-screen bg-[#EEF3FB] p-4 font-sans",
  wrap:       "max-w-4xl mx-auto",

  // Cards
  card:       "bg-white border-2 border-[#D0DFF5] rounded-xl overflow-hidden mb-3",
  cardHeader: "px-4 py-3 border-b-2 border-[#F0F5FF] flex items-center justify-between",
  cardTitle:  "text-sm font-bold text-[#1B3A6B]",
  cardBody:   "p-4",

  // Wallet card (fond navy)
  walletCard: "bg-[#1B3A6B] rounded-xl p-4 mb-3",

  // Badges
  badgeOk:    "text-xs px-2 py-0.5 rounded font-bold bg-[#D0F0E0] text-[#004D30]",
  badgeWarn:  "text-xs px-2 py-0.5 rounded font-bold bg-[#FFF3CC] text-[#6A3A00]",
  badgeErr:   "text-xs px-2 py-0.5 rounded font-bold bg-[#FFE8E8] text-[#8B0000]",
  badgeNavy:  "text-xs px-2 py-0.5 rounded font-bold bg-[#1B3A6B] text-[#F5A800]",
  badgeInfo:  "text-xs px-2 py-0.5 rounded font-bold bg-[#E0EEFF] text-[#0A3A7A]",

  // Boutons
  btnPrimary: "bg-[#1B3A6B] text-white border-none px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-[#0F2347] transition-colors",
  btnAmber:   "bg-[#F5A800] text-[#1B2A3B] border-none px-4 py-3 rounded-lg text-sm font-bold cursor-pointer shadow-md hover:bg-[#E09600] transition-colors",
  btnSecond:  "bg-white border-2 border-[#C0CFDF] text-[#4A6A8A] px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors",
  btnDanger:  "bg-white border-2 border-[#CC2020]/40 text-[#CC2020] px-3 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#CC2020] hover:text-white transition-colors",

  // Inputs
  input:      "bg-[#F0F5FF] border-2 border-[#C0CFDF] rounded-lg px-3 py-2.5 text-[#1B3A6B] text-sm w-full font-sans outline-none focus:border-[#1B3A6B] focus:bg-white",
  label:      "text-xs text-[#4A6A8A] font-bold uppercase tracking-wide",

  // Info boxes
  infoBox:    "text-xs text-[#0A3A7A] bg-[#D8EAFF] border-2 border-[#1B5AAA] rounded-lg p-3 mb-3 leading-relaxed font-medium",
  warnBox:    "text-xs text-[#8B0000] bg-[#FFE8E8] border-2 border-[#CC2020] rounded-lg p-3 mb-3 leading-relaxed font-medium",
  okBox:      "text-xs text-[#004D30] bg-[#D0F0E0] border-2 border-[#007A4D] rounded-lg p-3 mb-3 leading-relaxed font-medium",
  amberBox:   "text-xs text-[#5A3A00] bg-[#FFFBF0] border-2 border-[#F5A800] rounded-lg p-3 mb-3 leading-relaxed",
  lockBox:    "text-xs text-[#3A4A5A] bg-[#E8EFF8] border-2 border-dashed border-[#8A9AB0] rounded-lg p-3 mb-3 leading-relaxed",

  // Rows
  infoRow:    "flex justify-between py-1.5 border-b border-dashed border-[#D0DFF5] text-xs last:border-none",
  rowLabel:   "text-[#4A6A8A] font-medium",
  rowValue:   "text-[#1B3A6B] font-bold text-right",

  // SHA bar
  shaBar:     "bg-[#1B3A6B] rounded-lg px-3 py-2 flex items-center gap-2 mt-2",

  // Montants
  amount:     "font-mono font-bold text-[#C05000]",
  amountLg:   "font-mono font-bold text-[#1B3A6B] text-3xl",

  // Topbar
  topbar:     "bg-[#1B3A6B] px-5 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-lg",
  brand:      "text-base font-bold tracking-widest text-[#F5A800]",

  // Accordion
  accBtn:     "w-full bg-[#F7FAFF] border-2 border-[#D0DFF5] rounded-xl px-3 py-2.5 cursor-pointer text-left font-sans mb-1.5 hover:border-[#1B3A6B] hover:bg-[#EEF3FB] transition-all",
  accBtnOpen: "w-full bg-[#EEF3FB] border-2 border-[#1B3A6B] rounded-xl rounded-b-none px-3 py-2.5 cursor-pointer text-left font-sans",
  accDetail:  "bg-[#EEF3FB] border-2 border-[#1B3A6B] border-t-0 rounded-xl rounded-t-none px-3 py-3 mb-1.5",

  // Stepper
  stepDot:    "w-8 h-8 rounded-full border-2 border-[#C0CFDF] bg-[#EEF3FB] flex items-center justify-center text-xs font-bold text-[#6A8AAA]",
  stepDotOn:  "w-8 h-8 rounded-full bg-[#1B3A6B] border-[#1B3A6B] flex items-center justify-center text-xs font-bold text-[#F5A800]",
  stepDotDone:"w-8 h-8 rounded-full bg-[#007A4D] border-[#007A4D] flex items-center justify-center text-xs font-bold text-white",
  stepLine:   "flex-1 h-0.5 bg-[#D0DFF5] mb-3.5",
  stepLineDone:"flex-1 h-0.5 bg-[#007A4D] mb-3.5",

  // Toggle
  tgl:        "relative inline-block w-10 h-5 cursor-pointer",

  // Nav bottom
  bottomNav:  "fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#D0DFF5] grid z-50",
  navItem:    "flex flex-col items-center justify-center py-2.5 cursor-pointer text-[#8A9AB0] hover:text-[#1B3A6B] transition-colors",
  navItemOn:  "flex flex-col items-center justify-center py-2.5 cursor-pointer text-[#1B3A6B]",
  navLabel:   "text-[9px] font-semibold mt-0.5",

} as const;

// Couleurs opérateurs Mobile Money - NE PAS MODIFIER
export const OP_COLORS = {
  WAVE:   { bg: "#F5A800", text: "#1B2A3B", label: "Wave CI" },
  ORANGE: { bg: "#FF6600", text: "#FFFFFF", label: "Orange Money CI" },
  MTN:    { bg: "#FFCC00", text: "#333333", label: "MTN MoMo CI" },
  MOOV:   { bg: "#0AAFFF", text: "#FFFFFF", label: "Moov Money CI" },
} as const;

// Status badges locataires quittances
export const RECEIPT_STATUS = {
  paid:      { label: "Payee",      class: "bg-[#007A4D] text-white text-[9px] px-2 py-0.5 rounded font-bold" },
  pending:   { label: "En attente", class: "bg-[#C0CFDF] text-[#3A4A5A] text-[9px] px-2 py-0.5 rounded font-bold" },
  cancelled: { label: "Annulee",    class: "bg-[#CC2020] text-white text-[9px] px-2 py-0.5 rounded font-bold" },
} as const;
