import { redirect } from "next/navigation";

/**
 * [IC-09] Ancienne page de « signature » côté bailleur. Elle refusait tous les accès (elle lisait un
 * champ inexistant) et ce n'est pas au bailleur de saisir le code : seul le locataire signe.
 * Le bailleur prépare et envoie le bail depuis l'écran « Bail complet ».
 */
export default async function LandlordLeaseSignaturePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/dashboard/leases/${id}/bail`);
}
