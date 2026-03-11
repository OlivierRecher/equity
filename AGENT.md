# PROJET : EQUITY 
# VERSION : 1.0.0 (MVP - High Quality Standards)
# DOCUMENTATION : AGENT.md

## 1. VISION DU PRODUIT
Application mobile collaborative de gestion de dette d'effort.
* **Philosophie :** Justice, Équilibre, Transparence.
* **Core Value :** Un algorithme de répartition juste qui gère les absences et la valeur perçue des tâches.

## 2. STACK TECHNIQUE & OUTILS QUALITÉ

### A. Backend (Node.js - Strict DDD/Hexagonal)
* **Runtime :** Node.js (LTS).
* **Langage :** TypeScript (Strict Mode).
* **Architecture :** Hexagonale (Domain, Application, Infrastructure, Interface).
* **Framework Web :** Express.js (Uniquement comme adaptateur d'entrée).
* **Persistance :** Prisma ORM & PostgreSQL (Uniquement comme adaptateur de sortie).
* **Testing :**
    * **Vitest**.
    * Coverage > 90% sur le Domain Layer.
    * **Mocks :** Utiliser `ts-mockito` pour isoler les couches.
    * **Test de flux :** Tester les use-cases de bout en bout.
    * **Test calcules des scores :** Les tests doivent en priorité couvrir les calculs des scores, les cas particuliers et les cas limites.
* **Linting/Formatting :** ESLint (config Airbnb), Prettier.
* **Communication :** API REST (JSON).
* **Refresh Strategy :** Polling client-side toutes les 30 secondes (Pas de WebSockets pour le MVP).

### B. Frontend (Mobile)
* **Framework :** React Native (via **Expo** SDK 50+).
* **Langage :** TypeScript.
* **Navigation :** `expo-router` (File-based routing).
* **UI/Animations :**
    * `react-native-reanimated` (Animations fluides, 60fps).
    * `react-native-gesture-handler` (Gestes natifs).
    * `@gorhom/bottom-sheet` (Modales interactives type Apple Maps).
* **State Management :** React Context (Simple pour MVP) ou Zustand.
* **HTTP Client :** `axios` ou `fetch` avec un hook de Polling custom.

## 3. RÈGLES MÉTIER (CORE DOMAIN)
*Ces règles doivent être implémentées dans la couche DOMAIN, sans dépendance à Prisma ou Express.*

### A. La Monnaie (Points)
* Chaque tâche a une valeur en points (ex: Vaisselle = 10 pts).
* La valeur est définie dans le `Catalog` mais figée dans l'`History` au moment de la réalisation (Snapshot).

### B. Gestion des Absences (CRITIQUE)
* **Par défaut :** Tous les membres du groupe sont bénéficiaires d'une tâche.
* **Absence :** L'utilisateur décoche manuellement les absents lors de la création de la tâche.
* **Conséquence :** Le coût de la tâche est divisé uniquement par le nombre de présents.

### C. Algorithme de Calcul de la Balance (Solde)
Pour chaque utilisateur $U$ :
$$Solde(U) = \text{Total\_Points\_Générés}(U) - \text{Total\_Points\_Consommés}(U)$$

* **Points Générés :** Somme des `value` des tâches où `userId == U`.
* **Points Consommés :** Pour chaque tâche $T$ où $U$ est dans `TaskBeneficiary` :
    $$Coût(T) = \frac{T.value}{\text{Nombre de bénéficiaires de } T}$$
    On somme tous les coûts.

### D. Suggestions (Planning)
* L'algorithme identifie le membre ayant le solde le plus bas (le plus négatif).
* Il suggère ce membre pour la prochaine tâche planifiée.

## 4. ARCHITECTURE BACKEND (DOSSIERS)
L'application doit suivre strictement le principe d'Inversion de Dépendance.

* Règle d'or : Le dossier domain ne doit jamais importer quelque chose venant de infrastructure ou interface.
* Flux de dépendance : Interface -> Application -> Domain <- Infrastructure.

Structure détaillée des dossiers /src :

```
/src
  /domain                 # 🟢 CŒUR DU MÉTIER (Pur TypeScript, 0 dépendances externes)
    /entities             # (Objets métiers avec identité : User, Task, Group)
    /value-objects        # (Objets immuables : Email, PointValue, Role)
    /ports                # (Interfaces définissant les contrats : ITaskRepository, ILogger)
    /services             # (Logique métier pure : BalanceCalculatorService)
    /errors               # (Erreurs métier : TaskAlreadyDoneError, UserNotFoundError)

  /application            # 🟡 CAS D'UTILISATION (Orchestration)
    /use-cases            # (Commandes : CreateTask, JoinGroup / Requêtes : GetDashboard)
    /dtos                 # (Input/Output pour les use-cases)

  /infrastructure         # 🔴 ADAPTATEURS SECONDAIRES (Sortie)
    /database
      /prisma             # (Schema & Client généré)
      /repositories       # (Implémentation de ITaskRepository via Prisma)
      /mappers            # (Conversion : Prisma Model <-> Domain Entity)
    /logging              # (Winston/Pino implémentant ILogger)

  /interface              # 🔵 ADAPTATEURS PRIMAIRES (Entrée)
    /http
      /controllers        # (Reçoit la requête HTTP -> Appelle le Use-Case -> Renvoie JSON)
      /routes             # (Définition des endpoints Express)
      /middlewares        # (AuthGuard, ErrorHandler global, Zod validation)
      /server.ts          # (Point d'entrée Express)
```

## 5. BASE DE DONNÉES (SCHEMA PRISMA)

```prisma
model User {
  id        String   @id @default(uuid())
  authId    String   @unique
  email     String   @unique
  name      String
  avatarUrl String?
  createdAt DateTime @default(now())
  memberships      GroupMember[]
  tasksDone        Task[]            @relation("TaskDoer")
  tasksBeneficiary TaskBeneficiary[]
}

model Group {
  id        String   @id @default(uuid())
  name      String
  code      String   @unique
  createdAt DateTime @default(now())
  memberships GroupMember[]
  catalog     Catalog[]
  tasks       Task[]
}

model GroupMember {
  id        String   @id @default(uuid())
  role      String   @default("MEMBER")
  joinedAt  DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  groupId   String
  group     Group    @relation(fields: [groupId], references: [id])
  @@unique([userId, groupId])
}

model Catalog {
  id           String   @id @default(uuid())
  name         String
  defaultValue Int
  icon         String
  groupId      String
  group        Group    @relation(fields: [groupId], references: [id])
  tasks        Task[]
}

model Task {
  id        String   @id @default(uuid())
  value     Int
  createdAt DateTime @default(now())
  groupId   String
  group     Group    @relation(fields: [groupId], references: [id])
  catalogId String?
  catalog   Catalog? @relation(fields: [catalogId], references: [id])
  userId    String
  doer      User     @relation("TaskDoer", fields: [userId], references: [id])
  beneficiaries TaskBeneficiary[]
}

model TaskBeneficiary {
  id     String @id @default(uuid())
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id])
  @@unique([taskId, userId])
}
```

```markdown
## 7. GESTION DES ERREURS
L'application ne doit jamais crasher silencieusement ou exposer des stack traces à l'utilisateur.

### A. Hiérarchie des Erreurs
- **DomainError** : Erreurs métier prévues (ex: `TaskValueInvalidError`, `UserNotMemberError`).
- **ApplicationError** : Erreurs de cas d'utilisation (ex: `InputValidationError`).
- **InfrastructureError** : Erreurs techniques (ex: `DatabaseConnectionError`).

### B. Flux de Gestion
1. Le **Domaine** lance (`throw`) des `DomainError`.
2. L'**Application** attrape ou laisse passer.
3. L'**Interface (Middleware Express)** attrape TOUTES les erreurs et les convertit en réponse HTTP standardisée :
   - `DomainError` -> `400 Bad Request` ou `422 Unprocessable Entity`.
   - `EntityNotFoundError` -> `404 Not Found`.
   - `UnauthorizedError` -> `401/403`.
   - Erreur inconnue -> `500 Internal Server Error` (avec log critique).
4. **Frontend** : L'interface utilisateur doit intercepter ces erreurs et les gérer de manière soignée (ex: notifications claires, feedback contextuel) pour garantir une expérience utilisateur fluide.

## 8. SÉCURITÉ & PERFORMANCE
- **Validation des Entrées** : Utiliser **Zod** dans la couche Interface (Controllers) pour valider les DTOs avant qu'ils n'atteignent le Domaine.
- **Types Strictes** : Pas de `any`. Jamais.
- **Optimisation** : Le calcul des soldes (`BalanceCalculator`) doit être pur et optimisé (complexité O(n)) pour supporter des historiques de milliers de tâches.
```

## 9. HISTORIQUE DU PROJET

> **⚠️ IMPORTANT** : Avant de commencer toute modification, lire impérativement le fichier **[PHASES_RECAP.md](./PHASES_RECAP.md)** à la racine du projet.
> Il contient le récapitulatif détaillé de chaque phase de développement (1 à 10), avec tous les fichiers créés, les endpoints API, l'arborescence complète, et les conventions à respecter.
> Ce fichier est la source de vérité pour comprendre l'état actuel du projet.

### Règles de mise à jour de PHASES_RECAP.md
- **Nouvelle phase** : ajouter une section complète décrivant tout ce qui a été implémenté (fichiers, endpoints, composants, décisions d'architecture).
- **Correctifs sur la phase en cours** : mettre à jour la section de la phase concernée avec les modifications précises (fichiers modifiés/supprimés, changements de comportement).
- **Correctifs sur des phases passées** : modifier directement la section de la phase concernée pour refléter l'état réel du code. Ne pas laisser d'informations obsolètes — le fichier doit toujours être le reflet exact de ce qui est en production.
- **Code mort supprimé** : retirer les références aux fichiers/composants supprimés dans les sections concernées, éviter les doublons.
 