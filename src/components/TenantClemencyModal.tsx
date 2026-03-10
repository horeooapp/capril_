"use client";

import { useState } from "react";
import { respondToClemency } from "@/actions/lease-procedures";

type TenantClemencyModalProps = {
    planId: string;
    details: string;
};

export default function TenantClemencyModal({ planId, details }: TenantClemencyModalProps) {
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleResponse = async (accepted: boolean) => {
        if (accepted && !acceptedTerms) {
            alert("Vous devez accepter les termes de l&apos;échéancier pour procéder.");
            return;
        }

        if (accepted && !signature.trim()) {
            alert("Veuillez saisir votre nom pour valider la signature électronique.");
            return;
        }

        setLoading(true);
        try {
            const result = await respondToClemency(planId, accepted, signature, "user_id_demo");
            if (result.success) {
                alert(accepted ? "Échéancier accepté et signé." : "Échéancier refusé.");
                window.location.reload();
            } else {
                alert("Erreur technique.");
            }
        } catch (e) {
            console.error(e);
            alert("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-300 max-w-md mx-auto my-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">Proposition de Clémence</h3>
            <div className="bg-yellow-50 p-4 rounded mb-6 text-sm text-yellow-900 whitespace-pre-wrap">
                {details}
            </div>

            <div className="mb-4">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="rounded text-blue-600"
                    />
                    <span>J&apos;accepte les termes de cet échéancier qui suspend temporairement la procédure d&apos;impayé.</span>
                </label>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature électronique (Tapez votre nom complet)</label>
                <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => handleResponse(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                    Refuser
                </button>
                <button
                    onClick={() => handleResponse(true)}
                    disabled={loading || !acceptedTerms || !signature.trim()}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Signer & Accepter
                </button>
            </div>
        </div>
    );
}
