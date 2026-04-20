import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h2 className="text-3xl font-black text-gray-900 uppercase">Lease introuvable</h2>
      <p className="text-gray-500 mt-4 mb-6">Le contrat avec l'ID demandé n'existe pas ou a été supprimé.</p>
      <Link href="/dashboard" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
        Retour au tableau de bord
      </Link>
    </div>
  )
}
