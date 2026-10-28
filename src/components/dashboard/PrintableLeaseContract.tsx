import React from 'react';
import { format, addMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { numberToFrenchWords } from '@/lib/number-to-letters';

interface PrintableLeaseContractProps {
  lease: any;
}

export default function PrintableLeaseContract({ lease }: PrintableLeaseContractProps) {
  if (!lease || !lease.property || !lease.landlord || !lease.tenant) return null;

  const property = lease.property;
  const landlord = lease.landlord;
  const tenant = lease.tenant;
  const rentAmount = lease.rentAmount || 0;
  const depositAmount = lease.depositAmount ?? lease.deposit ?? 0;
  const avanceAmount = lease.avanceLoyer || 0;
  
  const landlordName = landlord.fullName || (landlord.firstName ? (landlord.firstName + " " + (landlord.lastName || "")).trim() : "[Nom non renseigné]");
  const tenantName = tenant.fullName || (tenant.firstName ? (tenant.firstName + " " + (tenant.lastName || "")).trim() : "[Nom non renseigné]");
  
  const startDate = lease.startDate ? new Date(lease.startDate) : new Date();
  const startStr = format(startDate, 'dd MMMM yyyy', { locale: fr });
  
  // Logic for finding the months of "loyers d'avance"
  let avanceMonthsStr = "";
  if (avanceAmount > 0) {
      // Typically it's 1 or 2 months of avance
      const totalMonthsAdvanced = Math.floor(avanceAmount / rentAmount);
      // Construct a string like "janvier et février 2026"
      const months = [];
      for(let i = 0; i < totalMonthsAdvanced; i++) {
         const d = addMonths(startOfMonth(startDate), i);
         months.push(format(d, 'MMMM yyyy', { locale: fr }));
      }
      avanceMonthsStr = months.join(" et ");
  }

  return (
    <div id="print-area" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 bg-white text-black font-serif shadow-xl rounded my-4 md:my-8 print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:rounded-none">
      {/* HEADER */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
         <h1 className="text-lg md:text-xl font-bold uppercase tracking-widest">
            Contrat de Bail à Usage d'Habitation
         </h1>
         <p className="text-xs md:text-sm mt-2 font-bold italic">
            Texte de référence : Loi N°2019-576 du 26 juin 2019 instituant le Code de la Construction et de l'Habitat
         </p>
         <p className="text-xs text-gray-500 mt-1 uppercase">{(lease as any).officialLeaseNumber ? "N° OFFICIEL: " + (lease as any).officialLeaseNumber : "N° QAPRIL: " + lease.leaseReference}</p>
      </div>

      <h2 className="text-base md:text-lg font-bold mb-4 uppercase">Entre</h2>
      
      {/* BAILLEUR */}
      <div className="mb-6 leading-relaxed text-sm md:text-base">
        <p><strong>LE PROPRIETAIRE :</strong> {landlordName || "[Non renseigné]"}</p>
        <p><strong>Référence identité (CNI-RCCM) N° :</strong> {landlord.idCardNumber || "[Non renseigné]"}</p>
        <p><strong>Domicile ou siège social :</strong> {landlord.address || "[Non renseigné]"}</p>
        <p><strong>Tél :</strong> {landlord.phone || "[Non renseigné]"}</p>
        <p><strong>BP :</strong> {landlord.postalCode || "[Non renseigné]"}</p>
        <p><strong>Email :</strong> {landlord.email || "[Non renseigné]"}</p>
        <p><strong>Compte contribuable n° :</strong> {landlord.taxNumber || "[Non renseigné]"}</p>
        <p className="mt-2 italic text-xs md:text-sm">Dénommé au titre du présent acte « LE BAILLEUR » ou « LE PROPRIETAIRE »</p>
        <p className="text-right font-bold mt-2">D'une part</p>
      </div>
      
      <p className="text-center font-bold mb-4">ET</p>

      {/* LOCATAIRE */}
      <div className="mb-6 leading-relaxed text-sm md:text-base">
        <p><strong>LE LOCATAIRE :</strong> {tenantName || "[Non renseigné]"}</p>
        <p><strong>Référence identité (CNI-RCCM) N° :</strong> {tenant.idCardNumber || tenant.cniNumber || tenant.cni || "[Non renseigné]"}</p>
        <p><strong>Profession :</strong> {tenant.profession || tenant.jobTitle || "[Non renseigné]"}</p>
        <p><strong>Tél :</strong> {tenant.phone || "[Non renseigné]"}</p>
        <p><strong>BP :</strong> {tenant.postalCode || "[Non renseigné]"}</p>
        <p><strong>Email :</strong> {tenant.email || "[Non renseigné]"}</p>
        <p className="mt-2 italic text-xs md:text-sm">Dénommé au titre du présent acte « LE PRENEUR » ou « LE LOCATAIRE »</p>
        <p className="mt-2 italic text-xs md:text-sm">LESQUELS ont convenu et arrêté le contrat qui suit :</p>
        <p className="text-right font-bold mt-2">D'autre part</p>
      </div>

      <div className="mb-6 leading-relaxed text-justify text-sm md:text-base">
        <p>
            Le BAILLEUR donne à bail à titre d’habitation, pour une durée, sous les conditions et le prix ci-après indiqués au PRENEUR qui accepte, les biens immobiliers dont la désignation suit :
        </p>
        <div className="p-3 md:p-4 my-2 border border-gray-300 bg-gray-50 rounded italic whitespace-pre-wrap text-sm">
            {property.title || property.name || property.address || "Logement QAPRIL"} — {property.address || property.commune || "Abidjan, Côte d'Ivoire"}
            {property.description ? `\n${property.description}` : ""}
        </div>
        
        <p className="mt-4">
            Le PRENEUR déclare connaitre parfaitement le bien loué ou l’avoir vu et visité en vue du présent bail.
        </p>
        <p className="mt-2">
            Le PRENEUR prend les lieux loués dans l’état où ils se trouvent lors de l’entrée en jouissance et les rendra en fin de bail tels qu’il les aura reçus suivant l’état des lieux dressé par les parties.
        </p>
        <p className="mt-2">
            Un état des lieux contradictoire intermédiaire pourra être réalisé en cours d’exécution du contrat, afin de permettre au BAILLEUR de s’assurer que le LOCATAIRE jouit des lieux en bon père de famille. Dans le cas contraire, le BAILLEUR pourra mettre le LOCATAIRE en demeure de procéder aux réparations que le dépôt de garantie ne pourrait couvrir.
        </p>
        <p className="mt-2">
            A l’expiration du bail, un état des lieux contradictoire, en présence des parties, est également fait par les parties ou leurs représentants dûment mandatés. Le PRENEUR veillera à la remise des lieux dans leur état primitif (agencement, enduit, peinture intérieure, etc).
        </p>
      </div>

      {/* ARTICLES */}
      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 1 - DUREE ET RENOUVELLEMENT DU BAIL</h3>
      <div className="text-justify mb-4 text-xs md:text-sm">
        <p>Le présent bail est conclu pour une durée de : <strong>{lease.durationMonths === 0 ? "Durée Libre (Indéterminée)" : `${lease.durationMonths} mois`}</strong>.</p>
        <p className="mt-2">A l’échéance, le présent bail est renouvelé par tacite reconduction dans les mêmes conditions contractuelles au bénéfice du PRENEUR de bonne foi ou de ses ayants droit, à moins que :</p>
        <ul className="list-disc pl-5 md:pl-6 mt-1 space-y-1">
            <li>Le BAILLEUR déclare avoir besoin des lieux loués pour les occuper lui-même ou pour les faire occuper de manière effective par un ascendant ou descendant ou allié jusqu’au troisième (3ème) degré inclusivement ;</li>
            <li>Le LOCATAIRE ne remplisse pas ses obligations contractuelles ;</li>
            <li>Il existe d’autres motifs graves et légitimes à établir par le BAILLEUR, à l’exclusion du transfert de Propriété de l’immeuble ou du local qui ne vaut pas motif grave et légitime.</li>
        </ul>
      </div>

      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 2 - LOYER</h3>
      <div className="text-justify mb-4 text-xs md:text-sm">
        <p>Le montant du loyer est fixé en tenant compte de la valeur du marché de l’immeuble ou du local.</p>
        <p className="mt-2">
            Le présent bail est consenti et accepté moyennant un loyer mensuel de (en lettres) <strong>{numberToFrenchWords(rentAmount)}</strong> francs CFA (en chiffres) <strong>{rentAmount.toLocaleString()} FCFA</strong> payable par mois et d’avance au plus tard le <strong>{lease.paymentDay || 5}</strong> du mois en cours, en espèce ou par transfert à l’ordre du BAILLEUR.
        </p>
        <p className="mt-2">Le BAILLEUR est tenu de délivrer une quittance au LOCATAIRE pour faire la preuve du paiement du loyer.</p>
        <p className="mt-2">En cas de non-respect de l’obligation de délivrance de quittance de paiement de loyer par le BAILLEUR, le LOCATAIRE pourra faire la preuve du paiement du loyer par tous moyens.</p>
      </div>

      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 3 - REVISION DU LOYER</h3>
      <div className="text-justify mb-4 text-xs">
        <p>Le loyer peut être révisé à la hausse ou à la baisse tous les trois 3 ans.</p>
        <p>Les litiges relatifs à la révision du loyer peuvent être portés devant la juridiction compétente.</p>
        <p>La partie qui sollicite une augmentation ou une réduction du loyer doit préalablement notifier son intention à l’autre partie par tout moyen, au moins trois 3 mois avant la date d’effet de ladite révision et après la troisième année de la conclusion du bail ou de la précédente révision, sous peine de nullité de la clause contractuelle consacrant ladite révision.</p>
      </div>

      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 4 - DEPOT DE GARANTIE (ou CAUTION)</h3>
      <div className="text-justify mb-4 text-xs">
        <p>Le PRENEUR verse entre les mains du BAILLEUR, la somme de (en lettres) <strong>{numberToFrenchWords(depositAmount)}</strong> Francs CFA (en chiffres) <strong>{depositAmount.toLocaleString()} FCFA</strong> en guise de dépôt de garantie (ou caution).</p>
        <p className="mt-2">Ce montant ne peut excéder deux (02) mois de loyer. Il garantit l'exécution des obligations du PRENEUR en fin de contrat notamment les dégradations, les impayés ainsi que les divers manquements qui pourraient survenir de son fait.</p>
        <p className="mt-2">En cas de stipulation d'une garantie locative, un état des lieux écrit et contradictoire doit être signé entre les parties, au plus tard le jour de l'entrée en jouissance des lieux par le LOCATAIRE, et également le dernier jour de location, en fin de contrat.</p>
        <p className="mt-2 font-bold">Le dépôt de garantie n'est pas productif d'intérêt. Le LOCATAIRE ne peut se servir de dépôt de garantie au paiement des loyers, même en fin de contrat.</p>
        <p className="mt-2">Cette garantie locative est remboursée au PRENEUR dans un délai d'un (01) mois à compter de la restitution des clés, déduction faite, le cas échéant, des sommes restant dues au BAILLEUR et des sommes dont celui-ci pourrait être tenu, sous réserve qu'elles soient dûment justifiées.</p>
        <p className="mt-2">En cas de transfert de propriété à titre gratuit ou onéreux des locaux loués, la restitution du dépôt de garantie incombe au nouveau BAILLEUR. En cas d'insuffisance de dépôt de garantie pour compenser les frais de réparations et les dépenses effectuées par le BAILLEUR, celui-ci dispose d'une action en responsabilité contre le LOCATAIRE.</p>
      </div>

      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 5 - LOYERS D'AVANCE</h3>
      <div className="text-justify mb-4 text-xs md:text-sm">
        {avanceAmount > 0 ? (
            <>
                <p>Le PRENEUR verse entre les mains du BAILLEUR, à titre de loyers d'avance la somme de (en lettres) <strong>{numberToFrenchWords(avanceAmount)}</strong> Francs CFA (en chiffres) <strong>{avanceAmount.toLocaleString()} FCFA</strong> contre remise de quittance.</p>
                <p className="mt-2">Cette somme représente les loyers des mois de <strong>{avanceMonthsStr}</strong>.</p>
                <p className="mt-2 font-bold text-xs">Ce montant ne peut excéder deux (02) mois de loyer (Loi ivoirienne).</p>
            </>
        ) : (
            <p className="italic text-gray-500">Non applicable pour ce contrat (aucun loyer d'avance réglé).</p>
        )}
      </div>

      <h3 className="font-bold underline mt-6 mb-2 text-sm md:text-base">ARTICLE 6 - ENREGISTREMENT</h3>
      <div className="text-justify mb-4 text-xs">
        <p>Le bail à usage d'habitation fait obligatoirement l'objet d'enregistrement auprès de l'administration fiscale.</p>
        <p>Le bail à usage d'habitation est enregistré conformément aux conditions et modalités prévues par le Code Général des Impôts.</p>
        <p>Le BAILLEUR ou son représentant remet au LOCATAIRE, dans le délai de trente (30) jours calendaires, après l'accomplissement des formalités requises, un exemplaire de l'acte d'enregistrement du bail à usage d'habitation délivré par l'administration fiscale.</p>
      </div>

      <p className="text-center font-bold mt-8 mb-4 border-b border-black pb-2 uppercase text-sm md:text-base">SECTION 1: OBLIGATIONS DU BAILLEUR</p>
      
      <h3 className="font-bold underline mb-2 text-sm md:text-base">ARTICLE 7 - ETAT DU BIEN LOUE-VICES OU DEFAUTS APPARENTS OU CACHES</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs space-y-2">
        <p>Le BAILLEUR est tenu :</p>
        <ul className="list-disc pl-5 md:pl-6 space-y-1">
            <li>de livrer au LOCATAIRE l'immeuble ou le local loué;</li>
            <li>d’entretenir l'immeuble ou le local à usage d'habitation en état de servir à l'usage pour lequel il a été loué;</li>
            <li>d’en faire jouir paisiblement le LOCATAIRE pendant la durée du bail.</li>
        </ul>
        <p>Le BAILLEUR est tenu de remettre au LOCATAIRE un logement décent ne comportant aucun risque d'atteinte à la sécurité physique, à la santé ou aux biens du LOCATAIRE et de tout occupant de son chef.</p>
        <p>Le logement donné à bail doit comporter tous les éléments le rendant conforme à un usage sain, sécurisé et paisible.</p>
        <p>Le BAILLEUR doit garantir le LOCATAIRE contre tous les vices ou défauts de l'immeuble ou du local à usage d'habitation loué qui en empêchent l'usage normal, quand bien même le BAILLEUR ne les aurait pas connus au moment de la conclusion du bail. S'il résulte de ces vices ou défauts quelque perte pour le LOCATAIRE, le BAILLEUR est tenu de l’indemniser.</p>
        <p>Le BAILLEUR est également tenu de délivrer au LOCATAIRE l'immeuble ou le local loué avec les équipements mentionnés au bail en bon état de fonctionnement et de le garantir des vices ou défauts affectant lesdits équipements.</p>
        <p>Le BAILLEUR ne peut de son seul gré pendant la durée du bail ni changer la forme ou la destination de l'immeuble ou du local loué, ni en restreindre l'usage.</p>
      </div>

      <h3 className="font-bold underline mb-2 text-sm md:text-base">ARTICLE 8 - GROSSES REPARATIONS</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs space-y-2">
        <p>Le BAILLEUR est tenu d'entretenir l'immeuble ou le local loué, conformément à l'usage prévu au contrat et d'y faire à ses frais, toutes les grosses réparations, notamment celles concernant les murs porteurs ou de soutènement, les voûtes, les toitures, les poutres, les murs de clôture, les canalisations et fosses d'aisance, les puisards, les installations encastrées, les ascenseurs, les escaliers, les planchers, la vétusté de l'immeuble ou du local, le ravalement des façades de l'immeuble ou du local loué, et également tous travaux rendus nécessaires par un cas de force majeure.</p>
        <p>Lorsque le BAILLEUR n'effectue pas lesdites réparations, le LOCATAIRE peut, après une mise en demeure infructueuse, se faire autoriser par la juridiction compétente à exécuter les réparations aux frais du BAILLEUR. La juridiction compétente fixe le montant des réparations et les modalités de remboursement du LOCATAIRE.</p>
        <p>En cas d'urgence, le LOCATAIRE est fondé à faire les travaux incombant au BAILLEUR après l'avoir informé par tout moyen.</p>
        <p>Le LOCATAIRE peut demander en justice la résiliation du bail pour défaut des travaux incombant au BAILLEUR. La juridiction compétente, qui prononce la résiliation du bail pour défaut de travaux incombant au BAILLEUR, peut allouer, le cas échéant, des dommages et intérêts au LOCATAIRE ou à ses ayants droit.</p>
        <p>En l'absence des travaux de réparation incombant au BAILLEUR, le LOCATAIRE peut solliciter devant la juridiction compétente la réduction du loyer proportionnellement à l'atteinte portée à la jouissance de l'immeuble ou du local loué.</p>
      </div>

      <p className="text-center font-bold mt-8 mb-4 border-b border-black pb-2 uppercase text-sm md:text-base">SECTION 2: OBLIGATIONS DU PRENEUR</p>
      
      <h3 className="font-bold underline mb-2 text-sm md:text-base">ARTICLE 9 - DESTINATION DES LIEUX</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs"><p>Sauf stipulation contraire, le LOCATAIRE ne doit pas changer la destination de l'immeuble ou du local ou le transformer et faire des travaux d'amélioration de l'immeuble ou du local, sans l'accord écrit du BAILLEUR.</p></div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 10 - CESSION DE BAIL OU SOUS-LOCATION</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
          <p>La présente location est consentie au PRENEUR intuitu personae.</p>
          <p>Sauf disposition légale l'y autorisant ou autorisation expresse du BAILLEUR, le LOCATAIRE ne peut céder son bail ni sous-louer ou laisser à la disposition de tiers, même à titre gratuit, les lieux loués.</p>
          <p>Sont exemptés des dispositions de l'alinéa précédent, les ascendants et descendants directs du PRENEUR lorsqu'ils continuent d'honorer les obligations contractuelles à l'égard du BAILLEUR.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 11 - ENTRETIEN ET REPARATIONS</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs"><p>Le PRENEUR entretiendra les lieux loués en bon état de réparation locative, en jouira en bon père de famille, suivant leur usage et ne pourra en aucun cas, rien faire ni rien laisser qui puisse les détériorer. Il supportera toutes les réparations qui deviendraient nécessaires par la suite et toutes dégradations résultant de son fait ou de celui de sa famille ou de son personnel de maison.</p></div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 12 - AMENAGEMENTS, TRANSFORMATIONS, CONSTRUCTIONS</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
        <p>Lorsque le LOCATAIRE effectue des travaux dans l'immeuble ou le local à usage d'habitation, autres que les travaux de menu entretien, sans l'accord écrit du BAILLEUR, ce dernier peut demander :</p>
        <ul className="list-disc pl-5 md:pl-6 space-y-1 mt-1">
            <li>la résiliation du contrat;</li>
            <li>la remise en l'état de l'immeuble ou du local loué;</li>
            <li>la conservation à son profit des transformations ou améliorations effectuées sans que le LOCATAIRE puisse réclamer une indemnisation.</li>
        </ul>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 13 - DEGRADATIONS ET VOLS</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs"><p>Le PRENEUR est responsable des dégradations ou vols quelconques qui pourraient être commis par son personnel ou par des tiers dans les locaux loués et il en supportera les frais.</p></div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 14 - REMISE DES CLES</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs"><p>Le jour de l'expiration de la location, le PRENEUR devra remettre au BAILLEUR les clés des locaux. Dans le cas où, par le fait du PRENEUR, le BAILLEUR n'aurait pu mettre en location ou laisser visiter les lieux ou encore faire la livraison à un nouveau LOCATAIRE ou même en reprendre la libre disposition, il aura droit à une indemnité, sans préjudice de tous dommages et intérêts.</p></div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 15 - IMPOTS ET CHARGES LOCATIVES</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs"><p>Le PRENEUR s'acquittera, à partir du jour de l'entrée en jouissance, en sus du loyer ci-dessus fixé, de toutes les charges, les impôts fonciers restant à la charge du BAILLEUR.</p></div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 16 - LES CAUSES DE RESILIATION DU BAIL</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
        <p>Le bail à usage d'habitation peut être légitimement résilié avant son terme ou lorsqu'il est à durée indéterminée :</p>
        <ul className="list-disc pl-5 md:pl-6 space-y-1 mt-1">
            <li>en cas de force majeure;</li>
            <li>par accord commun des parties;</li>
            <li>en cas de manquement à ses obligations par l'une des parties;</li>
            <li>au terme d'un préavis de trois (03) mois notifié par écrit au BAILLEUR par le LOCATAIRE;</li>
            <li>au terme d'un congé de trois (03) mois notifié par écrit au LOCATAIRE par le BAILLEUR qui veut exercer son droit de reprise du bien pour l'occuper lui-même ou pour le faire occuper de manière effective par un ascendant ou descendant ou allié jusqu'au troisième (3) degré inclusivement.</li>
        </ul>
        <p className="mt-2">La lettre de demande de résiliation du bail doit être écrite, motivée et accompagnée, le cas échéant, de pièces justificatives. Elle est transmise à la partie adverse par voie de Commissaire de justice ou par voie de lettre recommandée avec avis de réception ou encore par remise de courrier contre décharge ou par courrier électronique, si les parties ont accepté ce mode de transmission.</p>
        <p className="mt-2">Lorsque le LOCATAIRE manque à ses obligations contractuelles, ou quand il accuse deux (02) mois de loyers impayés, le BAILLEUR peut, si bon lui semble, demander son expulsion forcée devant le juge des référés, quinze (15) jours après la notification faite par voie de Commissaire de Justice au LOCATAIRE d'avoir à régulariser sa situation, laquelle notification étant restée infructueuse.</p>
        <p className="mt-2">Sauf cas de force majeure, l'ancien LOCATAIRE a droit à des dommages-intérêts si, dans les trois (03) mois qui suivent son départ, les lieux ne sont pas occupés aux fins invoquées comme motif de la résiliation du bail soit dans la lettre de résiliation du bail, soit dans la requête introductive d'instance, soit dans le jugement.</p>
        <p className="mt-2">Le délai de trois (03) mois est suspendu pendant la durée des travaux de rénovation et de transformation entrepris de manière effective par le BAILLEUR sur l'immeuble ou le local loué.</p>
        <p className="mt-2">Si la juridiction compétente constate que le motif invoqué pour empêcher la prorogation légale du bail était frauduleux, le LOCATAIRE a droit à des dommages-intérêts qui ne peuvent être inférieurs au montant des loyers d'une année.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 17 - ABANDON DU LOCAL PAR LE LOCATAIRE</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
        <p>Lorsque le LOCATAIRE abandonne l'immeuble ou le local loué sans payer les loyers échus, le BAILLEUR fait constater l'abandon par voie de Commissaire de justice et peut demander l'autorisation d'ouverture des portes au juge des référés.</p>
        <p className="mt-1">En cas d'autorisation judiciaire d'ouverture des portes, le BAILLEUR établit par voie de Commissaire de justice, l'inventaire des biens du LOCATAIRE trouvés dans l'immeuble ou le local loué, les remet à un commissaire-priseur, en vue de leur vente publique préalablement autorisée par le juge.</p>
        <p className="mt-1">Le BAILLEUR peut saisir la juridiction compétente du lieu de situation de l'immeuble ou du local pour obtenir la résiliation du bail à usage d'habitation, la condamnation du LOCATAIRE l'ayant abandonné au paiement des loyers échus et de dommages et intérêts, et aussi l'autorisation de vendre aux enchères publiques les biens du LOCATAIRE trouvés dans l’immeuble ou le local loué.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 18 - DECES DU LOCATAIRE</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
          <p>En cas de décès du LOCATAIRE, le bail à usage d'habitation continue jusqu'à son terme :</p>
          <ul className="list-disc pl-5 md:pl-6 space-y-1 mt-1">
            <li>au profit du conjoint ayant cohabité avec le LOCATAIRE, si celui-ci paie effectivement les loyers échus;</li>
            <li>au profit du concubin ayant vécu en couple avec le LOCATAIRE, si celui-ci paie effectivement les loyers échus;</li>
            <li>au profit des descendants ou des ascendants, si ceux-ci paient effectivement les loyers échus.</li>
          </ul>
          <p className="mt-1">Au terme du bail à usage d'habitation précédemment conclu par le LOCATAIRE décédé, le BAILLEUR peut proposer un nouveau bail aux personnes ayant continué l'occupation de l'immeuble ou du local loué.</p>
          <p className="mt-1">A défaut de personnes remplissant les conditions prévues ci-dessus ou à défaut de personnes désirant continuer le bail, le bail est résilié de plein droit.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 19 - DROIT DE PREEMPTION DU LOCATAIRE EN CAS DE VENTE</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
          <p>Le LOCATAIRE bénéficie d'un droit de préemption en cas de vente de l'immeuble ou du local loué, à moins que celui-ci ne fasse l'objet d'une vente par adjudication publique ou qu'il ne soit cédé à un membre de la famille du BAILLEUR, parent ou allié, jusqu'au troisième (3) degré inclusivement.</p>
          <p className="mt-1">Le BAILLEUR qui veut vendre l'immeuble ou le local loué est tenu d'adresser au LOCATAIRE par tout moyen, une offre de vente. Dans l'offre de vente, le BAILLEUR doit avertir le LOCATAIRE qu'il a le droit de faire une contre-proposition.</p>
          <p className="mt-1">Le LOCATAIRE dispose d'un délai de sept (07) jours calendaires pour faire éventuellement une contre-proposition et d'un délai d'un (01) mois calendaire pour effectuer le paiement du prix de vente, sauf stipulation contraire des parties. Le silence du LOCATAIRE à l'expiration du délai de sept (07) jours calendaires ci-dessus, vaut refus de l'offre.</p>
          <p className="mt-1">Le BAILLEUR peut vendre l'immeuble ou le local loué à un tiers si celui-ci offre un prix supérieur à celui proposé par le LOCATAIRE dûment informé.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 20 - COPROPRIETE OU REGIME ASSIMILE</h3>
      <div className="text-justify mb-4 text-[11px] md:text-xs">
        <p>Dans le cas où le bien loué se trouverait en copropriété en raison de l'existence de parties communes ou de l'usage d'espaces, de services ou d'équipements communs, le BAILLEUR et le PRENEUR conviennent que les charges afférentes à ces parties communes seront à la charge exclusive du : <strong>LOCATAIRE (PRENEUR)</strong>.</p>
      </div>

      <h3 className="font-bold underline mt-4 mb-2 text-sm md:text-base">ARTICLE 21 - ELECTION DE DOMICILE ET ATTRIBUTION DE JURIDICTION</h3>
      <div className="text-justify mb-8 text-[11px] md:text-xs">
        <p>Pour l'exécution des présentes et de leurs suites, les parties font élection de domicile en leur domicile ou siège social indiqué au début du présent bail.</p>
        <p className="mt-2">En outre, toutes contestations qui pourraient s'élever pendant la durée du bail pourront être soumises à l'arbitrage de tout organisme qualifié à cette fin et requis par les parties; à défaut, le litige sera soumis à la juridiction compétente de la situation de l'immeuble ou du local loué.</p>
      </div>

      {/* FOOTER - SIGNATURE */}
      <p className="uppercase tracking-widest font-bold mb-8 text-sm md:text-base">DONT ACTE</p>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="text-sm md:text-base">
           <p>Fait à <strong>Abidjan</strong></p>
           <p className="mt-2">En 2 exemplaires originaux</p>
           <p className="mt-2">Le <strong>{startStr}</strong></p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
            <p className="italic text-gray-500 max-w-xs md:ml-auto text-[10px] md:text-xs border-2 border-dashed border-gray-400 p-3 md:p-4 rounded bg-gray-50">
                La signature de ce contrat s'effectue électroniquement via la plateforme QAPRIL au moyen d'un processus certifié OTP (Code par SMS) à l'Article 1367 du Code Civil ivoirien.
            </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between mt-8 md:mt-12 bg-gray-50/50 p-4 md:p-6 rounded border border-gray-200 gap-8">
        <div className="text-center w-full md:w-1/2">
            <p className="font-bold uppercase mb-8 md:mb-16 text-sm">LE BAILLEUR</p>
            {lease.signedAt && lease.status !== "PENDING" && <p className="text-green-600 font-bold border-t border-black pt-2 w-32 mx-auto text-xs md:text-sm">Signé électroniquement</p>}
        </div>
        <div className="text-center w-full md:w-1/2">
            <p className="font-bold uppercase mb-8 md:mb-16 text-sm">LE PRENEUR</p>
            {lease.signedAt && lease.status !== "PENDING" && <p className="text-green-600 font-bold border-t border-black pt-2 w-32 mx-auto text-xs md:text-sm">Signé numériquement</p>}
        </div>
      </div>

    </div>
  );
}
