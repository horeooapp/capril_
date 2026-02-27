"use client"

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-primary text-white shadow-lg px-6 py-3 rounded-full font-bold hover:bg-orange-600 flex items-center"
            dangerouslySetInnerHTML={{ __html: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Imprimer / PDF` }}
        />
    )
}
