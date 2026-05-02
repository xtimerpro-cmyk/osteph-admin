# O'Steph — Back office

Outils internes du food truck O'Steph (réservé à l'exploitant).

## Pages

- `admin.html` — Gestion clients fidélité (sync depuis JSONBin)
- `qr.html` — Mode QR kiosque pour générer les QR au camion

## Sécurité

- Mot de passe admin : `osteph2026` (à changer dans `admin.html`, constante `ADMIN_PASSWORD`)
- Repo **privé** sur GitHub recommandé

## Setup JSONBin (5 min)

1. Crée un compte sur https://jsonbin.io
2. Crée un bin avec le contenu `[]`
3. Récupère le **Bin ID** (24 chars dans l'URL après `/bin/`)
4. Récupère le **Master Key** (menu API Keys)
5. Dans `admin.html` (en ligne) → ⚙ Config JSONBin → colle les 2 valeurs

## URL du site public

Le QR généré dans `qr.html` pointe vers le site public.
URL configurée : https://xtimerpro-cmyk.github.io/osteph/numero.html

Modifie la constante `PUBLIC_SITE_URL` dans `qr.html` si tu changes de domaine.
