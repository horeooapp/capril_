"use client";

import { useState } from "react";
import { declareUnpaidRent, sendFormalNotice, proposeClemency, initiateTermination } from "@/actions/lease-procedures";

type UnpaidRentManagerProps = {
    leaseId: string;
    currentStatus: string;
};

export default function UnpaidRentManager({ leaseId, currentStatus }: UnpaidRentManagerProps) {
    const [loading, setLoading] = useState(false);
    const [clemencyDetails, setClemencyDetails] = useState("");
    const [showClemencyForm, setShowClemencyForm] = useState(false);

    const handleAction = async (actionFn: any, ...args: any[]) => {
        setLoading(true);
        try {
            // Pour la démo on passe "user_id_demo"
            const result = await actionFn(leaseId, ...args, "user_id_demo");
            if (result.success) {
                alert("Action réussie. La page va se recharger.");
                window.location.reload();
            } else {
                alert("Erreur lors de l'action.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur technique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestion des Procédures</h3>
            <p className="text-sm text-gray-600 mb-6">
                Statut actuel du bail : <span className="font-semibold px-2 py-1 bg-gray-100 rounded">{currentStatus}</span>
            </p>

            <div className="flex flex-wrap gap-3">
                {(currentStatus === "ACTIVE" || currentStatus === "PENDING") && (
                    <button
                        onClick={() => handleAction(declareUnpaidRent)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Signaler un impayé
                    </button>
                )}

                {(currentStatus === "LOYER_IMPAYE" || currentStatus === "REPRISE_PROCEDURE") && (
                    <button
                        onClick={() => handleAction(sendFormalNotice)}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                    >
                        Envoyer Mise en Demeure
                    </button>
                )}

                {["LOYER_IMPAYE", "MISE_EN_DEMEURE", "DELAI_LEGAL", "REPRISE_PROCEDURE"].includes(currentStatus) && (
                    <button
                        onClick={() => setShowClemencyForm(!showClemencyForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Proposer une Clémence
                    </button>
                )}

                {currentStatus === "REPRISE_PROCEDURE" && (
                    <button
                        onClick={() => handleAction(initiateTermination)}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
                    >
                        Initier Résiliation
                    </button>
                )}
            </div>

            {showClemencyForm && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">Proposer un échéancier (Clémence)</h4>
                    <textarea
                        value={clemencyDetails}
                        onChange={(e) => setClemencyDetails(e.target.value)}
                        placeholder="Détails de l'échéancier (ex: paiement en 3 fois les 5 du mois)..."
                        className="w-full p-2 border rounded mb-3"
                        rows={3}
                    />
                    <button
                        onClick={() => handleAction(proposeClemency, clemencyDetails)}
                        disabled={loading || !clemencyDetails.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                        Soumettre la proposition
                    </button>
                </div>
            )}
        </div>
    );
}
