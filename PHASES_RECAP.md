# EQUITY — Récapitulatif complet des Phases 1 à 13

> Ce document sert de **mémoire de projet** pour tout assistant AI travaillant sur Equity.
> Il décrit précisément ce qui a été construit, fichier par fichier, phase par phase.

---

## Contexte du projet

**Equity** est une application mobile collaborative de gestion de **dette d'effort**.
Philosophie : Justice, Équilibre, Transparence.
Un algorithme de répartition juste calcule combien chaque membre d'un groupe a contribué vs consommé en effort domestique.

**Stack :**
- **Backend** : Node.js + TypeScript strict + Express 5 + Prisma ORM + PostgreSQL — Architecture hexagonale (DDD)
- **Frontend** : React Native (Expo SDK 50+) + TypeScript + expo-router + react-native-reanimated + @gorhom/bottom-sheet
- **Tests** : Vitest (backend), tests unitaires du domain layer
- **Mono-repo** : `/server` (backend) + `/mobile` (frontend) à la racine

---

## Phase 1+2 — Initialisation du projet & Architecture hexagonale

**Commit :** `63fc3e2 feat(): Phase 1 + 2`

### Ce qui a été fait :
1. **Initialisation du mono-repo** avec `/server` et `/mobile`
2. **AGENT.md** créé — spécification complète du produit, des règles métier, de l'architecture, et du schéma Prisma (cf. `AGENT.md` à la racine)
3. **Architecture hexagonale backend** mise en place :

```
server/src/
  domain/           # Cœur métier pur (0 dépendances externes)
    entities/       # User.ts, Task.ts (+ index.ts)
    ports/          # IUserRepository, ITaskRepository, ICatalogRepository, IGroupRepository (+ index.ts)
    services/       # BalanceCalculator.ts (+ __tests__/ + index.ts)
    errors/         # (erreurs métier)
  application/      # Orchestration
    use-cases/      # (cas d'utilisation)
    dtos/           # (I/O des use-cases)
  infrastructure/   # Adaptateurs de sortie
    database/
      prisma/       # Schema + client Prisma
      repositories/ # PrismaUserRepo, PrismaTaskRepo, PrismaCatalogRepo, PrismaGroupRepo (+ index.ts)
  interface/        # Adaptateurs d'entrée
    http/
      controllers/  # AuthController, GroupController, SpaceController
      routes/       # auth.routes, group.routes, space.routes
      middlewares/  # SimpleAuthMiddleware, ErrorHandler
      server.ts     # Composition Root (DI manuelle) + Express app
  types/            # Types partagés
```

4. **Entités domaine** :
   - `User` : `{ id, email, name, passwordHash }`
   - `Task` : `{ id, value, userId, groupId, catalogId?, beneficiaryIds[], createdAt }`

5. **Service domaine — `BalanceCalculator`** :
   - `calculateBalances(users, tasks)` → `Map<userId, UserBalance>`
   - `getSuggestedNextDoer(users, tasks)` → `User | null` (solde le plus bas)
   - Algorithme : `Balance(U) = Σ points_générés - Σ (task.value / nb_bénéficiaires)`
   - Complexité O(n), pur, sans effets de bord
   - **Tests unitaires** dans `domain/services/__tests__/`

6. **Ports (interfaces)** définis :
   - `IUserRepository` : `findById`, `findByEmail`, `create`
   - `ITaskRepository` : `findByGroupId`, `create`
   - `ICatalogRepository` : `findByGroupId`, `findById`, `create`, `update`
   - `IGroupRepository` : `findById`, `findByCode`, `create`, `addMember`, `isMember`, `findAllByUserId`

---

## Phase 3 — Schéma Prisma & Modélisation BDD

**Commit :** `6205ea2 feat(): Phase 3`

### Schéma Prisma (`server/prisma/schema.prisma`) :

| Model | Champs clés | Relations |
|-------|-------------|-----------|
| `User` | id (uuid), email (unique), name, passwordHash | → GroupMember[], Task[] (doer), TaskBeneficiary[] |
| `Group` | id (uuid), name, code (unique), createdAt | → GroupMember[], Catalog[], Task[] |
| `GroupMember` | id, role ("ADMIN"/"MEMBER"), userId, groupId | → User, Group. @@unique([userId, groupId]) |
| `Catalog` | id, name, defaultValue (Int), icon (String), groupId | → Group, Task[] |
| `Task` | id, value (Int), userId, groupId, catalogId? | → Group, Catalog?, User (doer), TaskBeneficiary[] |
| `TaskBeneficiary` | id, taskId, userId | → Task (onDelete: Cascade), User. @@unique([taskId, userId]) |

**Points importants :**
- `Task.value` est un **snapshot** figé au moment de la réalisation (pas une référence au Catalog)
- `TaskBeneficiary` = les membres qui bénéficient de la tâche (gestion des absences)
- `Group.code` = code d'invitation unique pour rejoindre un espace
- Le schéma AGENT.md mentionne `authId` et `avatarUrl` sur User, mais l'implémentation réelle utilise `passwordHash` (auth locale, pas OAuth)

---

## Phase 4 — Base de données & Repositories

**Commit :** `3676220 feat(): Phase 4 init db`

### Ce qui a été fait :
1. **PrismaClient** configuré avec adaptateur PostgreSQL (`@prisma/adapter-pg`)
2. **4 repositories Prisma** implémentant les ports du domaine :
   - `PrismaUserRepository` → `findById`, `findByEmail`, `create`
   - `PrismaTaskRepository` → `findByGroupId` (avec include des beneficiaries), `create`
   - `PrismaCatalogRepository` → `findByGroupId`, `findById`, `create`, `update`
   - `PrismaGroupRepository` → `findById`, `findByCode`, `create`, `addMember`, `isMember`, `findAllByUserId`
3. **Seed script** (`prisma/seed.ts`) pour initialiser la BDD avec des données de test

---

## Phase 5 — Frontend de base (Expo + Dashboard)

**Commit :** `f536aec feat(): Phase 5 start front`

### Ce qui a été fait :
1. **Projet Expo** initialisé dans `/mobile` avec `expo-router`
2. **Layout racine** (`app/_layout.tsx`) :
   - `GestureHandlerRootView` → `QueryClientProvider` → `AuthProvider` → `ThemeProvider` → `Stack`
   - Auth guard dans `RootNavigator` : redirige `/auth/login`, `/hub`, ou `/(tabs)`
3. **Dashboard principal** (`app/(tabs)/index.tsx`) :
   - Fetche `GET /groups/:groupId/dashboard` via `react-query`
   - Affiche : `BalanceChart`, suggestion du prochain doer, liste des soldes, `ActivityFeed`
   - Bottom sheets : `AddTaskSheet`, `CatalogSheet`, `CatalogFormSheet`
   - Barre flottante en bas : boutons "Ajouter" et "Catalogue"
4. **Service API** (`src/services/api.ts`) :
   - `apiFetch<T>()` wrapper typé avec headers auth (`x-user-id`, `x-group-id`)
   - `setAuthHeaders()` / `clearAuthHeaders()` appelés par AuthContext
   - Toutes les fonctions API exportées (voir détail phase par phase ci-dessous)
5. **Types frontend** (`src/types/dashboard.ts`) miroir des DTOs backend :
   - `GroupDashboardDTO`, `UserBalanceDTO`, `SuggestedDoerDTO`, `TaskHistoryItemDTO`, `CatalogItemDTO`
   - `CreateTaskInput`, `TaskCreatedDTO`
   - `UpdateCatalogItemInput`, `CatalogItemUpdatedDTO`
   - `CreateCatalogItemInput`, `CatalogItemCreatedDTO`
6. **QueryClient** configuré avec `staleTime: 30_000` et `retry: 2`

---

## Phase 6 — Interactions (Ajout de tâches)

**Commits :** `4b7080c` + `5080cd3 feat(): Phase 6 add interaction`

### Backend :
1. **Use case `CreateTask`** :
   - Reçoit `{ catalogId?, value, beneficiaryIds }` + userId (du header) + groupId
   - Crée la Task + les TaskBeneficiary
   - Retourne `TaskCreatedDTO`
2. **Route** : `POST /groups/:groupId/tasks`
3. **Use case `CreateCatalogItem`** :
   - Reçoit `{ name, defaultValue, icon }` + groupId
   - Retourne `CatalogItemCreatedDTO`
4. **Route** : `POST /groups/:groupId/catalog`

### Frontend :
1. **`AddTaskSheet`** (`src/components/dashboard/AddTaskSheet.tsx`) :
   - Bottom sheet `@gorhom/bottom-sheet` à 2 snap points
   - Sélection du catalog item, valeur personnalisable, toggle des bénéficiaires (gestion des absences)
   - Mutation via `react-query` → `POST /groups/:groupId/tasks`
   - Invalidation du cache `['dashboard']` après soumission
2. **`FloatingControlBar`** (`src/components/dashboard/FloatingControlBar.tsx`) :
   - Barre flottante en bas avec boutons "+" (ajouter tâche) et "📋" (catalogue)

---

## Phase 7 — Historique & Catalogue

**Commits :** `1557387` → `14b4804` → `f6e5d20` → `61673f3 feat(): Phase 7 history and catalog`

### Backend :
1. **Use case `GetGroupDashboard`** enrichi :
   - Retourne `balances[]`, `suggestedNextDoer`, `history[]` (30 dernières tâches), `catalog[]`
   - L'historique inclut : `id, taskName, doerName, value, date`
2. **Use case `UpdateCatalogItem`** :
   - Reçoit `{ name?, defaultValue?, icon? }` (partiel)
   - Retourne `CatalogItemUpdatedDTO`
3. **Route** : `PATCH /groups/:groupId/catalog/:catalogId`

### Frontend :
1. **`ActivityFeed`** (`src/components/dashboard/ActivityFeed.tsx`) :
   - Liste scrollable des 30 dernières tâches avec nom, auteur, valeur, date relative
2. **`BalanceChart`** (`src/components/dashboard/BalanceChart.tsx`) :
   - Graphique en barres horizontales des soldes de chaque membre
   - Couleurs vert (positif) / rouge (négatif)
3. **`CatalogSheet`** (`src/components/dashboard/CatalogSheet.tsx`) :
   - Bottom sheet listant les tâches du catalogue avec icône, nom, valeur par défaut
   - Bouton "Ajouter" pour créer un nouveau catalog item
   - Tap sur un item → ouvre le form en mode édition
4. **`CatalogFormSheet`** (`src/components/dashboard/CatalogFormSheet.tsx`) :
   - Bottom sheet formulaire (create/edit) avec champ nom, valeur, sélecteur d'icône
   - Mode édition : pré-remplit les champs, PATCH au submit
   - Mode création : champs vides, POST au submit
   - Gestion du clavier (snap points adaptatifs)

---

## Phase 8 — Middleware d'authentification

**Commit :** `363c247 feat(): Phase 8 middleware`

### Ce qui a été fait :
1. **`SimpleAuthMiddleware`** (`server/src/interface/http/middlewares/SimpleAuthMiddleware.ts`) :
   - Lit `x-user-id` et `x-group-id` des headers de la requête
   - `x-user-id` obligatoire, `x-group-id` **optionnel** (pour les nouveaux users sans groupe)
   - Injecte `req.userId` et `req.groupId` dans l'objet request
   - Retourne 401 si `x-user-id` manquant
2. **`ErrorHandler`** (`server/src/interface/http/middlewares/ErrorHandler.ts`) :
   - Middleware Express global, catch-all
   - Retourne des réponses JSON standardisées avec le bon status HTTP
3. **Tests unitaires** du middleware (`SimpleAuthMiddleware.spec.ts`)
4. **Wiring** dans `server.ts` :
   - `/auth` → pas de middleware auth
   - `/spaces` → routes protégées (SimpleAuthMiddleware via route-level)
   - `/groups` → routes protégées
5. **Type extension** (`server/src/types/express.d.ts`) pour `req.userId` et `req.groupId`

---

## Phase 9 — Authentification (Login/Register)

**Commit :** `dd981c2 feat(): Phase 9 Login Page`

### Backend :
1. **Use case `RegisterUser`** :
   - Reçoit `{ name, email, password }`
   - Hash le password avec `bcryptjs`
   - Crée le User
   - Retourne `{ user: { id, name, email }, groupId: null }` (nouveau user, pas de groupe)
2. **Use case `LoginUser`** :
   - Reçoit `{ email, password }`
   - Vérifie le password hashé
   - Récupère le premier groupId du user (via `groupRepository.findAllByUserId`)
   - Retourne `{ user: { id, name, email }, groupId: string|null }`
3. **`AuthController`** + routes :
   - `POST /auth/register` → RegisterUser
   - `POST /auth/login` → LoginUser

### Frontend :
1. **`AuthContext`** (`src/context/AuthContext.tsx`) :
   - State : `user`, `groupId`, `isLoading`
   - Actions : `login()`, `register()`, `logout()`, `switchGroup()`
   - Persistence via `expo-secure-store` (4 clés : user_id, user_name, user_email, group_id)
   - Restaure la session au mount
   - Appelle `setAuthHeaders()` / `clearAuthHeaders()` sur les actions API
2. **Écran Login** (`app/auth/login.tsx`) :
   - Champs email + password, bouton connexion
   - Lien vers register
   - Design iOS natif (fond blanc, inputs minimalistes)
3. **Écran Register** (`app/auth/register.tsx`) :
   - Champs nom + email + password + confirmation
   - Bouton inscription
   - Lien vers login
4. **Auth layout** (`app/auth/_layout.tsx`) : Stack sans header
5. **Auth guard** dans `app/_layout.tsx` :
   - Pas connecté → `/auth/login`
   - Connecté sans groupId → `/hub`
   - Connecté avec groupId + sur auth → `/(tabs)`

---

## Phase 10 — Multi-Espaces (Hub + Création + Pull-Down Switcher)

**Commits :** `57fcc36` + `433741e` + `e633fa3`

### Backend :
1. **Use case `CreateGroup`** :
   - Reçoit `{ name, template? }` + userId
   - Génère un `code` d'invitation unique (6 chars)
   - Crée le Group, ajoute le créateur comme `ADMIN`
   - Si template = `coloc` ou `family` → seed le catalogue avec des tâches prédéfinies
   - Retourne `{ id, name, code }`
2. **Use case `GetUserGroups`** :
   - Retourne la liste des espaces du user avec rôle et nombre de membres
3. **Use case `JoinGroup`** :
   - Reçoit `{ code }` + userId
   - Vérifie que le code existe et que le user n'est pas déjà membre
   - Ajoute le user comme `MEMBER`
   - Retourne `{ groupId, groupName }`
4. **`SpaceController`** + routes :
   - `GET /spaces` → GetUserGroups (requiert x-user-id)
   - `POST /spaces` → CreateGroup
   - `POST /spaces/join` → JoinGroup
5. **`GetGroupDashboard`** enrichi → retourne aussi `groupName`

### Frontend — Hub :
1. **`hub/_layout.tsx`** : Stack layout sans header
2. **`hub/index.tsx`** (HubScreen) :
   - Liste des espaces du user (FlatList)
   - Chaque carte : nom, badge rôle (Admin/Membre), nombre de membres
   - Tap → `switchGroup()` + navigate `/(tabs)`
   - Section "Rejoindre" : champ code + bouton
   - Boutons : "Nouvel espace", "Déconnexion"
3. **`hub/join.tsx`** : page dédiée rejoindre via code
4. **Tunnel de création** :
   - `hub/create/_layout.tsx` : Stack sans header
   - `hub/create/name.tsx` (étape 1/3) : champ nom de l'espace
   - `hub/create/template.tsx` (étape 2/3) : choix template (Colocation 🏠 / Famille 👨‍👩‍👧‍👦 / Vide ✨)
   - `hub/create/invite.tsx` (étape 3/3) : affiche le code d'invitation à partager

### Frontend — Dashboard Pull-Down Switcher :
1. **`SpacePullDown`** (`src/components/dashboard/SpacePullDown.tsx`) :
   - Composant wrapper autour du dashboard
   - **Layer arrière** : preview du hub (titre "Mes espaces de répartition", liste des espaces, boutons "Nouvel espace" + "Rejoindre via un code")
   - **Layer avant** : le dashboard lui-même
   - **Interaction** : Pan gesture sur le header (nom du groupe + chevron animé)
   - **Pull down** : translateY libre (pas de limite). Au relâchement :
     - Si drag > seuil (80px) ou vélocité > 500 → spring vers `SCREEN_HEIGHT`, puis `router.replace('/hub')`
     - Sinon → snap back vers 0
   - **Animations** : spring config, border-radius interpolé (0→8px), scale-down subtil, chevron rotation 0→180°
   - Le dashboard est **démonté** quand on arrive au hub (pas d'overlay)
2. **Transitions de navigation** (`app/_layout.tsx`) :
   - `screenOptions={{ animation: 'slide_from_bottom' }}` sur le Stack global
   - `(tabs)` → `animation: 'fade'` (retour du hub au dashboard)
   - `auth` → `animation: 'fade'`
   - `hub` → `animation: 'none'` (le pull-down est la transition)
3. Auth guard modifié : ne redirige plus depuis `/hub` vers `/(tabs)` quand groupId existe

---

## Phase 11 — Droit à l'erreur (Édition / Suppression de tâches)

**Commits :** `fadf586 feat(): Phase 11 - edition delete task`

### Ce qui a été fait :
1. **Suppression (Backend)** :
   - `findById()` ajouté à `ITaskRepository` et implémenté dans Prisma.
   - Use case `DeleteTask.ts` : vérifie que l'utilisateur est le créateur ou `ADMIN`, puis supprime (Prisma gère la cascade sur `TaskBeneficiary`).
   - Route : `DELETE /groups/:groupId/tasks/:taskId`.
2. **Édition (Backend)** :
   - Use case `UpdateTask.ts` : vérifie les droits, supprime l'ancienne tâche et recrée la nouvelle (pour gérer proprement les modifications de bénéficiaires) en conservant `createdAt` et `userId` d'origine.
   - Route : `PATCH /groups/:groupId/tasks/:taskId`.
3. **Frontend (`AddTaskSheet.tsx` réutilisable)** :
   - Le formulaire de création de tâche a été rendu intelligent : il accepte une prop optionnelle `editTask`.
   - Si `editTask` est présent, les champs (tâche, valeur, bénéficiaires exclus) sont pré-remplis, et le bouton submit fait un `PATCH` (via `updateTask`).
4. **Frontend (`TaskDetailsSheet.tsx`)** :
   - Nouvelle modale affichant les détails d'une tâche (auteur, date, points) cliquée depuis l'ActivityFeed.
   - Fournit un bouton "Supprimer" rouge (avec une `Alert` de confirmation native) et une icône "Crayon" (Pencil) en haut à droite pour éditer.
   - Tous les membres peuvent éditer ou supprimer une tâche (pas de check frontend sur l'auteur, alignement sur la confiance du groupe).
5. **Corrections (`api.ts`)** :
   - Customisation de la fonction `apiFetch` pour vérifier si la réponse a le status HTTP `204 No Content` afin d'éviter l'erreur `JSON Parse error` lors du `.json()`.

---

## Phase 13 — Hub UX + Profile Menu + Group Settings + Catalog Soft Delete

### 13a. Header fix & Profile Menu

#### Hub header :
1. **`hub/index.tsx`** et **`SpacePullDown.tsx`** : `paddingTop: 60` → `16` (titre plus haut)
2. **Bouton "Déconnexion"** remplacé par un **avatar circulaire** (initiale du user, fond noir) dans les deux écrans
3. **`ProfileSheet`** (`src/components/ProfileSheet.tsx`) — nouveau bottom sheet :
   - Avatar avec initiale, nom, email
   - Bouton "Se déconnecter" rouge
   - Ouvert au tap sur l'avatar dans le hub et dans le hub preview (SpacePullDown)

### 13b. Group Settings (Admin only)

#### Backend — Nouveaux endpoints sur `space.routes.ts` :
1. `PATCH /spaces/:groupId` — renommer le groupe (`UpdateGroupName`)
2. `GET /spaces/:groupId/members` — lister les membres (`GetGroupMembers`)
3. `DELETE /spaces/:groupId/members/:userId` — retirer un membre (`RemoveGroupMember`)
4. `DELETE /spaces/:groupId` — supprimer le groupe (`DeleteGroup`)
5. `GET /spaces/:groupId/invite-code` — récupérer le code d'invitation

#### Nouveaux use cases :
- **`UpdateGroupName`** : vérifie admin, rename via `IGroupRepository.updateName()`
- **`GetGroupMembers`** : retourne `{ userId, userName, role }[]` via `IGroupRepository.getMembers()`
- **`RemoveGroupMember`** : vérifie admin, interdit de se retirer soi-même, supprime via `IGroupRepository.removeMember()`
- **`DeleteGroup`** : vérifie admin, supprime le groupe (cascade Prisma)

#### Modifications `IGroupRepository` + `PrismaGroupRepository` :
- `updateName(groupId, name)` → `GroupDTO`
- `getMembers(groupId)` → `{ userId, userName, role }[]`
- `removeMember(groupId, userId)` → `void`
- `delete(groupId)` → `void`

#### Modifications `SpaceController` :
- 5 nouveaux handlers : `rename`, `listMembers`, `removeMember`, `deleteSpace`, `getInviteCode`

#### Wiring `server.ts` :
- 4 nouveaux use cases instanciés et injectés dans `SpaceController` (7 dépendances au total)

#### Prisma Schema — Cascade on Group delete :
- `GroupMember` → `Group` : `onDelete: Cascade`
- `Catalog` → `Group` : `onDelete: Cascade`
- `Task` → `Group` : `onDelete: Cascade`
- `Task` → `Catalog` : `onDelete: SetNull` (garde les tâches si un item catalogue est supprimé)

#### Frontend — `GroupSettingsSheet` (bottom sheet sur le dashboard) :
- **`GroupSettingsSheet`** (`src/components/dashboard/GroupSettingsSheet.tsx`) — bottom sheet (75%) contenant :
  - Nom de l'espace : champ éditable (save on blur/submit)
  - Code d'invitation : affichage + bouton copier (`expo-clipboard`)
  - Liste des membres : avatar + nom + rôle + icône Trash2 pour retirer (sauf soi-même)
  - Bouton "Supprimer l'espace" rouge avec Alert.confirm
- **`SpacePullDown`** modifié — header dashboard restructuré :
  - Layout : `[GroupName][ChevronDown] ........... [Settings icon]`
  - Chevron collé au titre (pressable → pull down vers hub)
  - Icône Settings à droite (visible admin only) → ouvre `GroupSettingsSheet`
  - Props ajoutées : `isAdmin?: boolean`, `onSettingsPress?: () => void`
- **`DashboardScreen`** (`app/(tabs)/index.tsx`) : ref + callbacks pour le settings sheet, props `isAdmin` et `onSettingsPress` passés à SpacePullDown
- **`GetGroupDashboard` enrichi** (backend + frontend) :
  - Retourne `members: GroupMemberDTO[]`, `groupCode: string`, `role?: string`
  - Les membres sont pré-chargés dans le dashboard → aucune animation de loading dans le settings sheet
- **Types** (`mobile/src/types/dashboard.ts`) :
  - `GroupMemberDTO { userId, userName, role }` ajouté
  - `GroupDashboardDTO` enrichi avec `members`, `groupCode`, `role`
- **API** (`mobile/src/services/api.ts`) — nouvelles fonctions :
  - `updateGroupName(groupId, name)`
  - `fetchGroupMembers(groupId)`
  - `removeGroupMember(groupId, userId)`
  - `deleteGroup(groupId)`

### 13c. Catalog Soft Delete (Admin only)

#### Backend :
1. **Migration Prisma** : `deletedAt DateTime?` ajouté au model `Catalog`
2. **`ICatalogRepository`** enrichi :
   - `findByGroupId()` → filtre `deletedAt: null` (items actifs uniquement)
   - `findAllByGroupId()` — nouveau, sans filtre deletedAt (pour résolution des noms dans l'historique)
   - `softDelete(catalogId)` → `update({ deletedAt: new Date() })`
3. **`PrismaCatalogRepository`** : implémente les 3 méthodes
4. **`GetGroupDashboard`** modifié :
   - Utilise `findAllByGroupId()` pour le `catalogMap` (résolution des noms dans l'historique, y compris items supprimés)
   - Utilise `findByGroupId()` pour le champ `catalog` du DTO (items actifs uniquement)
5. **Use case `SoftDeleteCatalogItem`** : vérifie admin via `getMemberRole()`, vérifie ownership via `findById()`, appelle `softDelete()`
6. **Route** : `DELETE /groups/:groupId/catalog/:catalogId` → `GroupController.deleteCatalogItem`

#### Frontend :
1. **`CatalogSheet`** modifié :
   - Props ajoutées : `isAdmin: boolean`, `groupId: string`
   - Icône Trash2 rouge sur chaque row (visible admin only)
   - Au tap → Alert.confirm → `softDeleteCatalogItem(groupId, catalogId)` → invalidation cache
2. **`DashboardScreen`** passe `isAdmin` et `groupId` au `CatalogSheet`
3. **API** (`api.ts`) : `softDeleteCatalogItem(groupId, catalogId)` ajouté

---

## API REST — Résumé complet des endpoints

| Méthode | Route | Auth? | Description |
|---------|-------|-------|-------------|
| `GET` | `/health` | Non | Health check |
| `POST` | `/auth/register` | Non | Inscription (`{ name, email, password }`) |
| `POST` | `/auth/login` | Non | Connexion (`{ email, password }`) |
| `GET` | `/spaces` | JWT | Liste des espaces du user |
| `POST` | `/spaces` | JWT | Créer un espace (`{ name, template? }`) |
| `POST` | `/spaces/join` | JWT | Rejoindre via code (`{ code }`) |
| `PATCH` | `/spaces/:groupId` | JWT | Renommer le groupe (admin) |
| `GET` | `/spaces/:groupId/members` | JWT | Lister les membres du groupe |
| `DELETE` | `/spaces/:groupId/members/:userId` | JWT | Retirer un membre (admin) |
| `DELETE` | `/spaces/:groupId` | JWT | Supprimer le groupe (admin) |
| `GET` | `/spaces/:groupId/invite-code` | JWT | Récupérer le code d'invitation |
| `GET` | `/groups/:groupId/dashboard` | JWT | Dashboard complet (+ role, members, groupCode) |
| `POST` | `/groups/:groupId/tasks` | JWT | Créer une tâche |
| `POST` | `/groups/:groupId/catalog` | JWT | Créer un catalog item |
| `PATCH` | `/groups/:groupId/catalog/:catalogId` | JWT | Modifier un catalog item |
| `DELETE` | `/groups/:groupId/catalog/:catalogId` | JWT | Soft-delete un catalog item (admin) |
| `DELETE` | `/groups/:groupId/tasks/:taskId` | JWT | Supprimer une tâche |
| `PATCH` | `/groups/:groupId/tasks/:taskId` | JWT | Modifier une tâche |

---

## Composition Root (`server.ts`)

L'injection de dépendances est manuelle (pas de container IoC) :

```
PrismaClient → Repositories → Use Cases → Controllers → Routes → Express app
```

Ordre dans `server.ts` :
1. `createPrismaClient()`
2. 4 repositories : `PrismaTaskRepo`, `PrismaUserRepo`, `PrismaCatalogRepo`, `PrismaGroupRepo`
3. 14 use cases : `GetGroupDashboard`, `CreateTask`, `UpdateCatalogItem`, `CreateCatalogItem`, `RegisterUser`, `LoginUser`, `CreateGroup`, `GetUserGroups`, `JoinGroup`, `DeleteTask`, `UpdateTask`, `UpdateGroupName`, `GetGroupMembers`, `RemoveGroupMember`, `DeleteGroup`, `SoftDeleteCatalogItem`
4. 3 controllers : `GroupController` (7 use cases), `AuthController` (2), `SpaceController` (7)
5. Routes montées : `/auth`, `/spaces`, `/groups`
6. `errorHandler` (must be last)

---

## Arborescence mobile complète

```
mobile/
  app/
    _layout.tsx           # Root: GestureHandler → QueryClient → Auth → Theme → Stack
    modal.tsx             # Modal placeholder
    (tabs)/
      _layout.tsx         # Tab layout (actuellement 1 seul tab)
      index.tsx           # Dashboard principal
    auth/
      _layout.tsx         # Stack auth
      login.tsx           # Écran connexion
      register.tsx        # Écran inscription
    hub/
      _layout.tsx         # Stack hub
      index.tsx           # Liste des espaces + avatar profil
      join.tsx            # Rejoindre via code
      create/
        _layout.tsx       # Stack création
        name.tsx          # Étape 1: nom
        template.tsx      # Étape 2: template
        invite.tsx        # Étape 3: code d'invitation
  src/
    components/
      ProfileSheet.tsx         # Bottom sheet profil (avatar, nom, email, logout)
      dashboard/
        ActivityFeed.tsx       # Liste historique des tâches
        AddTaskSheet.tsx       # Bottom sheet ajout de tâche
        BalanceChart.tsx       # Graphique barres des soldes
        CatalogFormSheet.tsx   # Form create/edit catalog item
        CatalogSheet.tsx       # Liste du catalogue (+ soft delete admin)
        FloatingControlBar.tsx # Barre flottante bas de l'écran
        GroupSettingsSheet.tsx  # Bottom sheet réglages groupe (admin)
        SpacePullDown.tsx      # Pull-down gesture pour switch d'espace (+ settings icon)
        TaskDetailsSheet.tsx   # Détails d'une tâche (edit/delete)
    context/
      AuthContext.tsx        # Provider auth (login, register, logout, switchGroup)
    services/
      api.ts                # Wrapper fetch typé + toutes les fonctions API
    types/
      dashboard.ts          # DTOs frontend (miroir backend)
```

---

## Conventions & Patterns à respecter

1. **Hexagonal strict** : le dossier `domain/` n'importe JAMAIS depuis `infrastructure/` ou `interface/`
2. **Pas de `any`** : TypeScript strict partout
3. **Tests** : Vitest, coverage > 90% sur le domain layer
4. **Auth** : JWT Bearer token (`Authorization: Bearer <token>`) + `x-group-id` header optionnel
5. **Polling** : 30s côté client via `react-query` `staleTime`
6. **UI** : design iOS natif, couleurs système Apple (`#F2F2F7`, `#1C1C1E`, `#8E8E93`, `#007AFF`, `#34C759`, `#FF3B30`)
7. **Bottom sheets** : `@gorhom/bottom-sheet` pour toutes les modales interactives
8. **Animations** : `react-native-reanimated` + `react-native-gesture-handler`
9. **State** : React Context (AuthContext) + react-query pour le server state
10. **Navigation** : `expo-router` file-based, transitions verticales (`slide_from_bottom`)

---

## Prochaines étapes potentielles

- Planning/suggestions de tâches plus avancées
- Notifications push
- OAuth (Google) en remplacement de l'auth par password
- Dark mode complet
- WebSockets pour le temps réel (post-MVP)
