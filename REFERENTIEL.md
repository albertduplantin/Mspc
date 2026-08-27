# Référentiel Bac Pro MSPC — extrait de travail

Source : *Arrêté et référentiel du baccalauréat professionnel « Maintenance des
Systèmes de Production Connectés »*, MAJ 03-12-2019 — pages 56 à 61 pour ce qui
suit. Ce fichier n'est pas publié dans le site : il sert de garde-fou à la
rédaction des dossiers de cours.

## Règles générales, valables pour tous les savoirs

> « Pour l'ensemble des savoirs associés, il ne s'agit pas de réaliser une
> présentation exhaustive de ces derniers mais d'analyser les solutions
> constructives en s'appuyant sur des cas concrets issus d'une réelle
> problématique de maintenance. »

**Niveaux taxonomiques** (Bloom tronqué) :

| Niveau | Nom | Actions attendues |
|---|---|---|
| 1 | Information | décrire, identifier, sélectionner |
| 2 | Compréhension | expliquer, interpréter, lire, reconnaître, utiliser |
| 3 | Application | appliquer, calculer, déterminer |
| 4 | *(non utilisé)* | — |

> « Les niveaux 4, 5 et 6 de la taxonomie de Bloom ne sont pas utilisés pour la
> définition des connaissances en BAC PRO MSPC. »

Conséquence directe : **aucun savoir ne dépasse « application ».** Pas d'analyse
critique, pas de synthèse, pas d'évaluation attendues sur les connaissances.

## Compétences

- **C1** Organiser et optimiser son intervention de maintenance
  - C1.1 Analyser l'organisation fonctionnelle, structurelle et temporelle d'un système
  - C1.2 Identifier et caractériser la chaîne d'énergie
  - C1.3 Identifier et caractériser la chaîne d'information
  - C1.4 Préparer son intervention de maintenance
  - C1.5 Participer à l'arrêt, à la remise en service d'un système
  - C1.6 Respecter les règles environnementales
  - C1.7 Identifier et maîtriser les risques pour les biens et les personnes
- **C2** Réaliser les interventions de maintenance préventive (éco-responsable)
  - C2.1 Surveillance et inspection · C2.2 Préventive systématique · C2.3 Préventive conditionnelle
- **C3** Réaliser les interventions de maintenance corrective (éco-responsable)
  - C3.1 Diagnostiquer · C3.2 Dépanner, réparer · C3.3 Communiquer, rendre compte · C3.4 Conseiller l'exploitant
- **C4** Réaliser les interventions d'amélioration continue (éco-responsable)

## Savoirs associés — architecture

- **S1 L'approche système** — S1.1 analyse fonctionnelle · S1.2 analyse structurelle
  et solutions constructives · S1.3 matériaux · S1.4 comportement des systèmes mécaniques
- **S2 La chaîne d'énergie** — S2.1 énergie/puissance/rendement · S2.2 stockage ·
  S2.3 transmission · S2.4 conversion · S2.5 adaptation · S2.6 variation
- **S3 La chaîne d'information** — S3.1 acquisition · S3.2 traitement · S3.3 communication
- **S4 Interventions de maintenance** — S4.1 à S4.11 (dont S4.7 réseaux, cybersécurité,
  maintenance connectée ; S4.9 procédés d'assemblage et fabrication)

---

## S1 — L'APPROCHE SYSTÈME (détail utile à la mécanique)

| Savoir | Niv. | Limite de connaissances (texte officiel, abrégé) |
|---|:--:|---|
| S1.1.1 Cahier des charges fonctionnel | 2 | Lecture et compréhension seulement des outils (SADT, FAST…) |
| S1.1.2 Description interne, chaînes d'énergie et d'information | 2 | Faire apparaître les flux d'énergie, d'information, de matière. Vocabulaire imposé : **alimenter, distribuer, convertir, moduler, stocker, transmettre, agir** |
| S1.1.3 Outils descripteurs et schématisation | 2 | Normes fournies, « décoder ou compléter un schéma en se limitant à quelques symboles » |
| **S1.2.1** Assemblage sans mouvement, guidage rotation/translation, rotule | **3** | À aborder **du point de vue maintenance lors d'activités pratiques**. Lubrification (désignation normalisée d'une huile, viscosité, techniques, limites), étanchéité statique et dynamique (nature, forme, contraintes d'utilisation seulement), **usure, jeux, ajustements, tolérances, courses, spécifications géométriques, états de surface** |
| S1.2.2 Liaisons élastiques | 2 | Sollicitations, raideur, flexibilité. **Les lois (effort-déformation) et (couple-déformation) sont données** |
| S1.3.1 Nature des matériaux | 2 | **On se limite aux désignations normalisées**, aux caractéristiques et aptitudes mécaniques, thermiques, électriques |
| **S1.4.1** Modélisation des mécanismes | **3** | Nature du contact, degré de liberté, liaisons élémentaires et composées, classe d'équivalence, graphe de liaisons. **« Le schéma cinématique est complété et commenté et non élaboré dans son ensemble »** |
| **S1.4.2** Modélisation des actions mécaniques | **3** | Force, résultante, moment d'un couple ; représentation vectorielle graphique et analytique ; **nature du contact, adhérence et frottement**. « On privilégie la simulation » |
| **S1.4.3** Mouvements relatifs (transformation / rotation axe fixe) | **3** | Limité à translation et rotation autour d'un axe fixe, mouvements uniformes ou uniformément variés. Trajectoires, vecteurs vitesse |
| S1.4.3 L'accélération | 2 | On privilégie l'analyse de courbes issues de relevés ou de simulations |
| S1.4.4 Équiprojectivité, CIR | 3 | Représentation graphique dans les cas simples |
| S1.4.4 Composition des vitesses ; lois d'entrée-sortie des chaînes cinématiques | 2 | **La détermination des lois d'entrée-sortie s'effectue à l'aide d'un logiciel de simulation** |
| **S1.4.5** Isolement, actions mutuelles, PFS, méthodologie de résolution | **3** | **Résolution graphique pour 2 ou 3 actions mécaniques seulement.** Assistance informatique privilégiée |
| S1.4.5 PFD | 2 | Étude limitée à translation rectiligne ou rotation autour d'un axe fixe |
| S1.4.5 Équilibrage statique et dynamique | 2 | **Limitée aux balourds matérialisés par une masse ponctuelle excentrée.** Équilibrage d'un rotor |
| S1.4.5 Énergétique : formes de l'énergie mécanique, travail, puissance d'une force et d'un couple | 2 | Énergie potentielle de pesanteur et élastique, énergie cinétique. Translation et rotation axe fixe |
| **S1.4.6** RDM : la traction, le cisaillement | **3** | Toutes les études menées à partir d'une problématique de maintenance. **Pas d'essais** : passage par des logiciels de simulation |
| S1.4.6 Notion de contrainte, relation déformation-contrainte, notions de fatigue | 2 | Seules les sollicitations simples **traction, compression, matage, torsion, flexion** sont *identifiées*. **Les diagrammes sont donnés et analysés**, pas construits |

## S2 — LA CHAÎNE D'ÉNERGIE

| Savoir | Niv. | Limite de connaissances |
|---|:--:|---|
| **S2.1** Énergie, puissance, rendement ; nature et forme de l'énergie ; grandeurs et unités ; **analogie entre puissances électrique / mécanique / hydraulique / pneumatique** | **3** | « Les formules caractérisant les grandeurs physiques sont **connues, utilisées et correctement interprétées** » |
| S2.2 Stockage de l'énergie | 2 | Se limiter à identifier moyens et fonctions : volant d'inertie et ressort (méca), batterie et condensateur (élec), réservoir et accumulateur (fluide) |
| **S2.3** Nature des supports de transmission ; procédures d'assemblage | **3** | Identifier types et contraintes (câbles, flexibles, transmissions mécaniques). **Mettre en œuvre les procédures de connexion** |
| S2.3 Caractéristiques du support | 2 | Par exemples : pertes de charge, chutes de tension |
| **S2.4** Conversion : grandeurs d'entrée/sortie, principe, **réversibilité**, influence des réglages, actionneurs | **3** | Méca↔élec (moteur-générateur), méca↔fluidique (pompe-moteur, vérins, compresseurs), élec→lumineuse, chimique→élec |
| **S2.5** Adaptation : comportement cinématique, **loi entrée-sortie**, **réversibilité / irréversibilité**, puissance d'entrée et de sortie | **3** | Loi E/S mise en évidence par calculs simples, courbes, abaques constructeurs ou logiciels. Transmission **sans** transformation de mouvement (avec ou sans modification de vitesse angulaire) et **avec** transformation de mouvement |
| **S2.6** Variation de l'énergie | **3** | Au travers d'activités pratiques. **« La théorie de l'asservissement ne sera pas abordée »** |

---

## Conséquences retenues pour la rédaction des dossiers

1. **Cadrer chaque notion par une problématique de maintenance**, jamais par la
   physique pour elle-même. C'est une exigence répétée à chaque ligne du référentiel.
2. **Ne jamais dépasser le niveau « application ».** Un exercice qui demande de
   critiquer, de concevoir ou de choisir entre solutions sort du référentiel.
3. **Schéma cinématique : compléter et commenter, jamais élaborer.**
4. **Statique : résolution graphique, 2 ou 3 forces.** Pas de systèmes hyperstatiques,
   pas de torseurs.
5. **RDM : traction et cisaillement seuls en application.** Flexion, torsion, matage,
   fatigue : identification et lecture de diagrammes fournis.
6. **Ajustements, tolérances, jeux, états de surface, lubrification et étanchéité sont
   au niveau 3** — c'est le cœur mécanique du diplôme, à traiter en profondeur.
7. **Vocabulaire imposé** pour la chaîne d'énergie : alimenter · distribuer · convertir ·
   moduler · stocker · transmettre · agir.
8. Les animations pilotables du site répondent directement aux mentions répétées
   « on privilégie la simulation » et « à l'aide de logiciels ».
