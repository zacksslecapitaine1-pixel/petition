# Pétition de classe — « Libérons notre samedi »

Site React (Vite) + Supabase pour recueillir les positions (Pour / Contre) et les signatures
dessinées des étudiants de la Licence 1 Informatique (DA-IA), Groupe 1, ESGIS.

## Fonctionnalités
- Parcours en 9 étapes animées (Framer Motion) : filière, contexte illustré, nom, prénom, genre, téléphone, position, signature dessinée, récapitulatif.
- Numéro d'enregistrement + carte de participation, partage WhatsApp.
- Un seul vote par étudiant et par filière (nom + prénom normalisés, insensibles aux accents/majuscules/ordre).
- Espace administrateur (`#/admin`) protégé par mot de passe : liste, recherche, totaux, export CSV,
  document PDF (lettre + synthèse + listes signées) via le bouton Imprimer.
- Responsive mobile, tolérant à plusieurs saisies simultanées (insertion atomique côté Postgres).

## Sécurité
- Les tables sont dans le schéma privé `app_private` (aucun accès direct avec la clé publique).
- Le site n’appelle que des fonctions SQL (`submit_signature`, `get_public_stats`, `admin_login`, `admin_list_full`, `admin_set_password`).
- Le mot de passe admin est stocké haché (bcrypt) ; 8 essais ratés = blocage de 5 minutes.
- La clé `sb_publishable_…` du code est publique par conception.

## Lancer en local
```bash
npm install
npm run dev
```

## Déployer sur GitHub Pages
1. Créer un dépôt GitHub et y pousser ce dossier (branche `main`).
2. Dépôt → Settings → Pages → Source : **GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` construit et publie le site automatiquement.
   Adresse : `https://<compte>.github.io/<depot>/` (le site utilise des chemins relatifs).

## Configuration
Tout se règle dans `src/lib/config.js` (texte de la lettre, noms des filières, clés Supabase).
Le script SQL de la base est dans `supabase/schema.sql`.

## Aperçu sans base de données
`VITE_DEMO=1 npm run build` produit une version démo (données fictives en mémoire, mot de passe admin « demo »).
