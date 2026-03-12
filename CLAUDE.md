# Instructions pour Claude Code

## Contexte du projet

Lire `PHASES_RECAP.md` en priorité — il contient l'architecture complète, les fichiers, les conventions et l'historique de toutes les phases. Cela suffit comme contexte initial, inutile d'explorer tout le repo.

## Efficacité tokens

- **Pas d'agent Explore** quand les fichiers à modifier sont connus ou listés dans un plan. Utiliser des `Read` parallèles directement.
- **Lire PHASES_RECAP.md d'abord**, puis uniquement les fichiers à modifier. Ne pas relire ce qui a déjà été résumé.
- **Demander confirmation avant de coder** si un choix UX/architecture est ambigu (bottom sheet vs écran, emplacement d'un composant, etc.).
- **Ne pas créer de fichier pour ensuite le supprimer** — clarifier l'intention avant.

## Conventions

- Backend : architecture hexagonale stricte (domain → application → infrastructure → interface)
- Frontend : React Native Expo, bottom sheets `@gorhom/bottom-sheet`, design iOS natif
- Auth : JWT Bearer token
- Server dev : `npm run dev` (tsx watch, pas besoin de build)
- Toujours vérifier `npx tsc --noEmit` sur server/ et mobile/ avant de considérer une tâche terminée
