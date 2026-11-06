_[Accueil](index.html) > Fonctionnalités d'accessibilité_

# Fonctionnalités d'accessibilité

_/!\ Ces améliorations sont disponibles depuis la version 14 de Sparnatural._

Sparnatural peut être utilisé avec un zoom fort, avec un lecteur d'écran et au clavier. Cette page décrit ce qui est pris en charge sur ces trois points, puis explique comment construire une requête au clavier.

## Le zoom

Sparnatural reste utilisable quand vous agrandissez la page avec le zoom du navigateur, jusqu'à 200 %. Quand la place manque, l'affichage s'adapte :

- un texte trop long, comme le nom d'une propriété, est coupé avec "..." et s'affiche en entier au survol de la souris ;
- autour du champ de valeur, les textes "(Type de Lieu)" et "Sélectionner" sont masqués. Si ce n'est pas suffisant, le champ passe sous "Tous·tes" ;
- "Chercher Type de Lieu qui +" s'affiche sur deux lignes ;
- pendant le chargement d'une liste, le message "(recherche...)" s'affiche dans la liste au lieu de sortir à droite ;
- les boutons "Réinitialiser la recherche" et "Lancer la recherche" restent visibles.

<img src="/assets/images/accessibility/zoom-200.png" alt="Sparnatural avec un zoom à 200 %" width="700">

## Les lecteurs d'écran

Ces améliorations ont été testées avec le lecteur d'écran NVDA et le navigateur Firefox.

### Des boutons nommés

Les boutons qui n'affichent qu'une icône ont un nom, lu par le lecteur d'écran. Les lignes sont numérotées dans leur ordre d'affichage, ce qui permet de savoir sur quelle ligne agit un bouton. Par exemple :

- **les listes** du sujet, de la propriété et de l'objet : "Choisir le sujet", "Choisir la propriété", "Choisir l'objet" ;
- **la croix d'une ligne** : "Supprimer la ligne 2" ;
- **la croix d'une valeur** : "Supprimer la valeur Rue" ;
- **l'œil** : "Afficher Lieu dans les résultats" ou "Masquer Lieu des résultats" ;
- **la flèche verte** : "Options de la ligne 2" ;
- **le bouton "+"** : "Ajouter une valeur à Type de Lieu" ;
- **le bouton "et"** : "et, ajouter une ligne après la ligne 2" ;
- **les boutons de la recherche** : "Réinitialiser la recherche" et "Lancer la recherche".

Les options des résultats sont nommées de la même façon : "Trier de A à Z", "Nom de la colonne", "Agrégation de la colonne Lieu", "Afficher les options des résultats".

### Des annonces

Après une action, un message court est lu, par exemple :

- "Sélection : Lieu"
- "Valeur rue ajoutée", "Valeur rue supprimée"
- "Ligne 2 ajoutée", "Ligne 2 supprimée"
- "Recherche des valeurs possibles", "Aucun résultat pour la ligne 2"
- "Recherche lancée", "Recherche réinitialisée"
- "Colonne Lieu affichée dans les résultats"

<img src="/assets/images/accessibility/nvda-visionneuse.png" alt="La visionneuse de parole de NVDA pendant la construction d'une requête" width="560">

## Construire une requête au clavier

L'élément qui a le focus est entouré d'un contour vert foncé. Les touches à utiliser sont :

- **Tab / Maj + Tab** : passer à l'élément suivant / précédent ;
- **flèches haut et bas** : parcourir une liste ;
- **Début / Fin** : aller au premier / dernier élément d'une liste ;
- **Entrée ou Espace** : choisir un élément, activer un bouton.

Les étapes ci-dessous construisent, comme exemple, la requête "les lieux dont le type de lieu est rue".

### 1. Choisir le sujet

Avec Tab, entrez dans Sparnatural : le focus arrive sur la liste du sujet. Parcourez-la avec les flèches haut et bas, puis choisissez "Lieu" avec Entrée.

<img src="/assets/images/accessibility/clavier-1-sujet.png" alt="La liste du sujet, Lieu atteint avec les flèches" width="600">

### 2. Choisir l'objet

Le focus passe tout seul à la liste des objets. Choisissez "Type de Lieu" de la même façon.

<img src="/assets/images/accessibility/clavier-2-objet.png" alt="La liste des objets, Type de Lieu atteint avec les flèches" width="600">

### 3. Choisir la propriété

Le focus passe ensuite à la liste des propriétés qui relient le sujet à l'objet. Choisissez "type de lieu (liste - class template)". S'il n'y a qu'une propriété possible, elle est choisie automatiquement et cette étape est sautée.

<img src="/assets/images/accessibility/clavier-3-propriete.png" alt="La liste des propriétés, une propriété atteinte avec les flèches" width="600">

### 4. Choisir la valeur

Le focus arrive sur "Tous·tes". Appuyez sur Entrée pour garder toutes les valeurs, ou sur la flèche du bas pour passer au champ de valeur.

<img src="/assets/images/accessibility/clavier-4-tous-tes.png" alt="Le focus sur Tous·tes" width="600">

Dans le champ, ouvrez la liste avec la flèche du bas ou en tapant le début de la valeur, ici "rue". Choisissez la valeur avec les flèches, puis appuyez sur Entrée. Dans le champ, les flèches servent au champ lui-même : utilisez Tab pour passer à "Chercher Type de Lieu qui +", et Maj + Tab pour revenir à "Tous·tes".

<img src="/assets/images/accessibility/clavier-5-valeur.png" alt="Le champ de valeur, rue tapé et la liste filtrée" width="600">

### 5. Parcourir les boutons de la ligne

Une fois la valeur choisie, la ligne est complète. Tab passe d'un bouton à l'autre de la ligne, et Entrée ou Espace active le bouton qui a le focus :

<table>
  <tr>
    <td width="50%"><img src="/assets/images/accessibility/clavier-6-options.png" alt="Le focus sur la flèche verte" style="width:100%"><br>Options de la ligne (flèche verte)</td>
    <td width="50%"><img src="/assets/images/accessibility/clavier-7-oeil.png" alt="Le focus sur l'œil de Type de Lieu" style="width:100%"><br>Afficher ou masquer "Type de Lieu" dans les résultats (œil)</td>
  </tr>
  <tr>
    <td><img src="/assets/images/accessibility/clavier-8-croix-classe.png" alt="Le focus sur la croix de Type de Lieu" style="width:100%"><br>Supprimer "Type de Lieu"</td>
    <td><img src="/assets/images/accessibility/clavier-9-croix-valeur.png" alt="Le focus sur la croix de la valeur rue" style="width:100%"><br>Supprimer la valeur "rue"</td>
  </tr>
  <tr>
    <td><img src="/assets/images/accessibility/clavier-10-ajouter-valeur.png" alt="Le focus sur le bouton +" style="width:100%"><br>Ajouter une valeur à "Type de Lieu" (+)</td>
    <td><img src="/assets/images/accessibility/clavier-11-croix-ligne.png" alt="Le focus sur la croix de la ligne" style="width:100%"><br>Supprimer la ligne</td>
  </tr>
</table>

### 6. Ajouter une ligne

Tab arrive ensuite sur "et". Entrée ajoute une nouvelle ligne. "et" n'apparaît qu'au survol de la souris ou quand il a le focus.

<img src="/assets/images/accessibility/clavier-12-et.png" alt="Le focus sur le bouton et" width="600">

### 7. Lancer la recherche

Tab passe enfin au bouton "Réinitialiser la recherche", puis au bouton "Lancer la recherche". Entrée lance la recherche.

<table>
  <tr>
    <td width="50%"><img src="/assets/images/accessibility/clavier-13-reinitialiser.png" alt="Le focus sur le bouton Réinitialiser la recherche" style="width:100%"><br>Réinitialiser la recherche</td>
    <td width="50%"><img src="/assets/images/accessibility/clavier-14-lancer.png" alt="Le focus sur le bouton Lancer la recherche" style="width:100%"><br>Lancer la recherche</td>
  </tr>
</table>

Les options des résultats (tri, nom des colonnes, agrégation) sont aussi accessibles avec Tab.

## Limites connues

- Réordonner les colonnes des résultats se fait encore à la souris, par glisser-déposer.
- À 200 %, quand une ligne a plusieurs valeurs, elles peuvent dépasser du cadre.
