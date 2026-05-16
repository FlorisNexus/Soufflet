# Ton clavier — Sabatini Musette Doré

> Doc humaine (français). Pour la logique code, voir [`src/constants/layouts.ts`](../src/constants/layouts.ts).

Ce document décrit **précisément** la disposition des boutons du clavier main-droite de ton accordéon, telle qu'elle a été calibrée empiriquement (8 points de référence validés). Si tu changes un jour d'instrument, ce fichier est l'endroit où documenter la nouvelle disposition avant de patcher `layouts.ts`.

---

## TL;DR

| Caractéristique | Valeur |
|---|---|
| Type | Chromatique à boutons, **système "Continental italien"** (C-system français/belge) |
| Rangées main droite | **5** (3 principales + 2 doublons mécaniques) |
| Boutons par rangée | **17, 18, 17, 18, 17** (alterné, en quinconce) |
| Total boutons | **87** |
| Intervalle entre 2 positions consécutives d'une même rangée | **+1 tierce mineure** (= +3 demi-tons) |
| Chaque rangée joue | Un **arpège de septième diminuée** (4 notes répétées par octave) |
| Étendue d'une rangée | ~4 octaves (16 ou 17 positions × 3 demi-tons) |

---

## Convention de numérotation

- **Rangée 1** = la plus à droite quand tu tiens l'instrument (côté extérieur, opposé au soufflet, proche du menton)
- **Rangée 5** = la plus à gauche (côté soufflet)
- **Position 1** = en haut de la rangée (note la plus grave)
- **Position 17 ou 18** = en bas de la rangée (note la plus aiguë)

---

## Les 3 rangées principales

Chaque rangée principale joue un seul **arpège de septième diminuée**. Trois rangées décalées d'un demi-ton chromatique chacune se complètent pour couvrir les **12 notes** du chromatique.

### Rangée 1 — Si♭ diminué (17 boutons)

Note de départ : **Si♭2** (MIDI 46). Notes répétées par cycle : **Si♭, Do#, Mi, Sol**.

| Position | Note | MIDI |
|----------|------|------|
| 1 | Si♭2 | 46 |
| 2 | Do#3 | 49 |
| 3 | Mi3 | 52 |
| 4 | Sol3 | 55 |
| 5 | Si♭3 | 58 |
| 6 | Do#4 | 61 |
| **7** | **Mi4** | **64** ← ton point de référence n° 1 |
| **8** | **Sol4** | **67** ← ton point de référence n° 2 |
| 9 | Si♭4 | 70 |
| 10 | Do#5 | 73 |
| 11 | Mi5 | 76 |
| 12 | Sol5 | 79 |
| 13 | Si♭5 | 82 |
| 14 | Do#6 | 85 |
| 15 | Mi6 | 88 |
| 16 | Sol6 | 91 |
| 17 | Si♭6 | 94 |

### Rangée 2 — La diminué (18 boutons)

Note de départ : **La2** (MIDI 45). Notes répétées : **La, Do, Ré#, Fa#**.

| Position | Note | MIDI |
|----------|------|------|
| 1 | La2 | 45 |
| 2 | Do3 | 48 |
| 3 | Ré#3 | 51 |
| 4 | Fa#3 | 54 |
| 5 | La3 | 57 |
| **6** | **Do4** | **60** ← **note de calibration** (référence officielle de l'app) |
| **7** | **Ré#4** | **63** ← référence n° 3 |
| **8** | **Fa#4** | **66** ← référence n° 4 |
| **9** | **La4** | **69** ← référence n° 5 |
| 10 | Do5 | 72 |
| 11 | Ré#5 | 75 |
| 12 | Fa#5 | 78 |
| 13 | La5 | 81 |
| 14 | Do6 | 84 |
| 15 | Ré#6 | 87 |
| 16 | Fa#6 | 90 |
| 17 | La6 | 93 |
| 18 | Do7 | 96 |

### Rangée 3 — Si diminué (17 boutons)

Note de départ : **Si2** (MIDI 47). Notes répétées : **Si, Ré, Fa, Sol#**.

| Position | Note | MIDI |
|----------|------|------|
| 1 | Si2 | 47 |
| 2 | Ré3 | 50 |
| 3 | Fa3 | 53 |
| 4 | Sol#3 | 56 |
| 5 | Si3 | 59 |
| **6** | **Ré4** | **62** ← référence n° 6 |
| 7 | Fa4 | 65 |
| 8 | Sol#4 | 68 |
| **9** | **Si4** | **71** ← référence n° 7 |
| 10 | Ré5 | 74 |
| 11 | Fa5 | 77 |
| 12 | Sol#5 | 80 |
| 13 | Si5 | 83 |
| 14 | Ré6 | 86 |
| 15 | Fa6 | 89 |
| 16 | Sol#6 | 92 |
| 17 | Si6 | 95 |

---

## Couverture chromatique

Les 3 rangées principales réunies couvrent **les 12 notes** du chromatique. Vérification :

- Rangée 1 contribue : **Si♭, Do#, Mi, Sol** (4 classes)
- Rangée 2 contribue : **La, Do, Ré#, Fa#** (4 classes)
- Rangée 3 contribue : **Si, Ré, Fa, Sol#** (4 classes)

Total : 12 classes de notes ✓. Aucun chevauchement entre les 3 rangées.

---

## Les 2 rangées de doublons mécaniques

Les **rangées 4 et 5** sont des **doublons mécaniques** : appuyer sur un de leurs boutons enfonce physiquement un bouton d'une rangée principale (même soupape, même note). Elles existent pour offrir des **doigtés alternatifs** plus accessibles selon la phrase musicale.

### Rangée 4 ↔ Rangée 1 (18 boutons)

Appuyer sur **rangée 4 position N** enfonce **rangée 1 position N** (pour N = 1 à 17).

| Position rangée 4 | Note jouée (= rangée 1) |
|---|---|
| 1 | Si♭2 |
| 7 | **Mi4** |
| 8 | **Sol4** |
| 17 | Si♭6 |
| **18** | **Orpheline** — aucun lien sur la rangée 1 (qui n'a que 17 boutons). Note inconnue, à vérifier en mode libre. |

### Rangée 5 ↔ Rangée 2 (17 boutons, décalée de +1 position)

Appuyer sur **rangée 5 position N** enfonce **rangée 2 position N+1** (décalage volontaire).

| Position rangée 5 | Position correspondante sur rangée 2 | Note jouée |
|---|---|---|
| 1 | 2 | Do3 |
| 5 | 6 | **Do4** |
| 6 | 7 | **Ré#4** |
| 17 | 18 | Do7 |

Conséquence : sur ton accordéon, **rangée 2 position 1** (= La2, la note la plus grave) n'est accessible **que** par la rangée 2 — la rangée 5 ne la duplique pas (à cause du décalage).

---

## Exemples concrets

### Où trouver un Do (sans préciser l'octave) ?

Toute note Do (Do2, Do3, Do4, Do5, Do6, Do7) appartient à la rangée 2 et son doublon rangée 5 :

| Note | Rangée 2 (position) | Rangée 5 (position) |
|---|---|---|
| Do3 (MIDI 48) | 2 | 1 |
| Do4 (MIDI 60) | 6 | 5 |
| Do5 (MIDI 72) | 10 | 9 |
| Do6 (MIDI 84) | 14 | 13 |

### Où trouver un Mi ?

Mi appartient à la rangée 1 et son doublon rangée 4 :

| Note | Rangée 1 (position) | Rangée 4 (position) |
|---|---|---|
| Mi3 (MIDI 52) | 3 | 3 |
| Mi4 (MIDI 64) | 7 | 7 |
| Mi5 (MIDI 76) | 11 | 11 |

### Une gamme de Do majeur ? (Do Ré Mi Fa Sol La Si Do)

Sur ton accordéon, jouer la gamme demande de zigzaguer entre les 3 rangées principales :

| Note | Rangée | Position |
|---|---|---|
| **Do4** | 2 | 6 |
| **Ré4** | 3 | 6 |
| **Mi4** | 1 | 7 |
| **Fa4** | 3 | 7 |
| **Sol4** | 1 | 8 |
| **La4** | 2 | 9 |
| **Si4** | 3 | 9 |
| **Do5** | 2 | 10 |

Tu remarques que les positions montent légèrement à mesure qu'on monte la gamme, et que la main alterne entre les 3 rangées principales. C'est typique des accordéons chromatiques italiens : la "gamme diagonale".

---

## Pourquoi ce système, et pas un autre ?

Plusieurs traditions facteur ont chacune leur convention :

| Système | Origine | Intervalle par position | Rangées principales |
|---|---|---|---|
| **Continental italien** (le tien) | Italie, France, Belgique (XIXᵉ) | tierce mineure (+3) | 3 arpèges diminués décalés d'un demi-ton |
| C-griff allemand / Bayan russe | Allemagne, Russie | ton entier (+2) | 3 gammes "tons entiers" décalées d'un demi-ton |
| B-griff (Bayan B) | Russie (variante) | ton entier (+2) | identique à C-griff, miroir horizontal |
| Diatonique (mélodéon) | Trad. populaire | varie (gamme tonale) | 2-3 rangées tonales, sons différents au pousser/tirer |

Le Continental italien est l'héritier direct des accordéons diatoniques populaires : il garde une logique "arpèges" plutôt que "gammes", ce qui facilite les accords musette (valse, polka, java).

---

## Calibration dans l'app

Au premier lancement, l'app demande de jouer **rangée 2 position 6** :
- Si elle entend un **Do** → tu es en **C-system** (cas de ton Sabatini) ✓
- Si elle entend un **Si** → tu es en **B-system** (variante miroir)
- Autre → réessai ou choix manuel

Le résultat est stocké dans `localStorage` sous la clé `soufflet.calibration` et persiste entre les sessions. Bouton "Recalibrer" disponible sur la page d'accueil si besoin de réinitialiser.

---

## Si jamais tu changes d'accordéon

Pour adapter l'app à un autre modèle :

1. **Compter les boutons** par rangée → mettre à jour `BUTTONS_PER_ROW` dans [`src/constants/layouts.ts`](../src/constants/layouts.ts).
2. **Identifier l'intervalle par position** : jouer 2 boutons consécutifs sur une même rangée et noter le saut → mettre à jour `SEMITONES_PER_POSITION`.
3. **Identifier la note de départ de chaque rangée** (position 1, la plus aiguë de la rangée — pardon, la plus grave — sa MIDI) → mettre à jour `C_SYSTEM_ROW_STARTS`.
4. **Identifier les doublons mécaniques** : pour chaque bouton des rangées 4-5, vérifier quel bouton des rangées 1-3 s'enfonce → mettre à jour le commentaire et éventuellement la logique de mapping.
5. Mettre à jour ce fichier ainsi que les tests dans `src/constants/layouts.test.ts`.

L'app "mode libre" (avec lecture des Hz + cents) est l'outil idéal pour faire cette calibration empirique : tu joues, tu lis, tu notes.
