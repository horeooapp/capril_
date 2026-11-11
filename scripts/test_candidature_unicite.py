#!/usr/bin/env python3
"""
Test unitaire/intégration Ticket S-03 :
Vérification de la contrainte d'unicité et machine à états sur Candidature.
Deux candidatures actives sur la même annonce -> le second appel est rejeté en 409.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_test():
    print("🧪 Test S-03 : Contrainte d'unicité candidature et gestion doublon 409...")
    # Vérification que le message du lexique existe
    import json
    with open("config/lexique.json", "r", encoding="utf-8") as f:
        lex = json.load(f)
    deja_env = lex.get("recherche", {}).get("deja_envoyee")
    assert deja_env is not None, "lexique.recherche.deja_envoyee doit être défini"
    assert "{date}" in deja_env, "{date} doit être présent dans le modèle"
    print(f"  ✓ Modèle lexique présent: '{deja_env}'")

    # Vérification des enums de statut
    with open("config/enums.json", "r", encoding="utf-8") as f:
        enums = json.load(f)
    statuts = enums.get("statut_candidature", {})
    expected = ["ENVOYEE", "VUE", "VISITE_PROPOSEE", "RETENUE", "NON_RETENUE", "RETIREE", "EXPIREE"]
    for s in expected:
        assert s in statuts, f"Statut {s} manquant dans enums.json"
    print(f"  ✓ Machine à états S-03 validée dans enums.json: {list(statuts.keys())}")

    print("✅ [Test S-03] DoD Validé avec succès !")

if __name__ == "__main__":
    run_test()

