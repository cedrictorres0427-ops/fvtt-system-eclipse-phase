# Eclipse Phase

Système Foundry VTT `eclipse-phase`.

## Installation

Dans Foundry : **Systèmes de jeu** → **Installer** → coller ce lien dans « URL du manifeste » :

```
https://github.com/cedrictorres0427-ops/fvtt-system-eclipse-phase/releases/latest/download/system.json
```

## Publier une nouvelle version

1. Augmenter `version` dans `system.json` et remplacer la version dans `download`.
2. Commit, puis tag `v<version>` poussé sur GitHub : l'action « Release » construit le zip et la release.

---

# Eclipse Phase v1 — Système Foundry VTT

**Jeu de rôle de transhumanisme, d'horreur et de conspiration**  
Posthuman Studios / Black Book Editions — Édition française

---

## Installation

### Méthode 1 : ZIP manuel
1. Décompresser `eclipse-phase.zip` dans `FoundryVTT/Data/systems/eclipse-phase/`
2. Relancer Foundry VTT
3. Créer un nouveau Monde avec le système **Eclipse Phase**

### Méthode 2 : URL manifest (si hébergé)
Dans Foundry → Gestionnaire de systèmes → Installer → coller l'URL du `system.json`

---

## Fonctionnalités v1.0

### ✅ Feuille de personnage
- **7 aptitudes** (COG, COO, INT, RÉF, AST, SOM, VOL) avec base + bonus morphe
- **52 compétences actives** avec calcul automatique (base aptitude + entraînement + bonus morphe + autres)
- **20 compétences de connaissances** (Art, Intérêt, Langue, Profession, Théorie)
- Statistiques dérivées calculées automatiquement :
  - Initiative = (INT + RÉF) / 5
  - Lucidité = VOL × 2
  - Seuil de Blessure = END / 5
  - Seuil de Mort = END × 1.5 (bio) ou × 2 (synthé)
  - Seuil de Trauma = LUC / 5
  - Seuil d'Aliénation = LUC × 2
  - Bonus de Dommages = SOM / 10

### 🎲 Système de jets d100
- **Cliquer** sur le score total d'une compétence pour lancer directement (difficulté Moyenne)
- **Shift + clic** = dialogue complet (difficulté, spécialisation, test par défaut)
- **Glisser** le score total vers la barre de macros pour créer un raccourci de jet
- Détection automatique des critiques :
  - **00** → Réussite Critique
  - **99** → Échec Critique
  - **Doubles** (11, 22, 33…) → Critique selon seuil
  - **MR ≥ 30** → Réussite Exceptionnelle
  - **ME ≥ 30** → Échec Cuisant
- **Audace** : boutons pour dépenser/regagner des points

### 📋 Onglets de la fiche
- **Compétences Actives** — toutes les compétences de combat et d'action
- **Connaissances** — arts, langues, professions, théories
- **Réputation & Identité** — 7 réseaux sociaux + aspects + passes psi
- **Équipement & Morphe** — morphe actuel, armure, équipements (items drag & drop)
- **Biographie & Notes** — concept, motivations, notes de sauvegarde

### 📦 Items (drag & drop sur la fiche)
- **Morphe** : avec bonus d'aptitudes, max d'aptitude, endurance, implants
- **Équipement** : armes (VD, PA, modes, munitions, portée), armures, divers
- **Aspect** : positif/négatif, coût PP, ego ou morphe
- **Passe Psi** : type Chi/Gamma, action, durée, portée, strain

---

## À venir (Saison 2)

- [x] Templates de morphes préconfigurés (compendium Morphes)
- [x] Compendium d'équipements
- [ ] Test opposé intégré depuis la fiche
- [ ] Gestion de la sauvegarde d'égo / rechargement
- [x] Support des PNJs simplifié (fiche PNJ + items Compétence)
- [x] Macro de jet d100 pour la barre rapide (glisser une compétence vers la barre)

---

## Notes de jeu

**Saisir une compétence** : le champ `Base` affiche le total de l'aptitude liée (calculé auto).  
Pour augmenter la compétence au-dessus de son aptitude, utiliser le champ caché qui apparaît au survol de la ligne.

**Spécialisation** : cocher lors du dialogue de jet (Shift+clic) pour ajouter +10.

**Compétences sans défaut*** : Assaut psi, Contrôle, Démolition, Infosec, Programmation, Sensation — marquées d'un `*`.
