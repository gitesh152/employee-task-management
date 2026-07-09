# Architecture & Flow Diagrams

## System Architecture Diagram

```mermaid
graph TB
    Client["🌐 Client Browser"]
    Frontend["⚛️ React Frontend<br/>(Vite + Redux + Tailwind)"]
    API["🔌 REST API<br/>(Express.js)"]
    Auth["🔐 Auth Service<br/>(JWT + Bcrypt)"]
    DB[(💾 MySQL Database)]
    Email["📧 Email Service"]
    FileStorage["📁 File Storage"]
    Scheduler["⏰ Task Scheduler<br/>(Notifications)"]
    
    Client -->|HTTP/HTTPS| Frontend
    Frontend -->|REST Requests| API
    API -->|Authenticate| Auth
    Auth -->|Query/Mutation| DB
    API -->|Send Emails| Email
    API -->|Store Files| FileStorage
    Scheduler -->|Check Deadlines| DB
    Scheduler -->|Trigger Notifications| Email
    
    style Client fill:#4A90E2
    style Frontend fill:#7ED321
    style API fill:#F5A623
    style Auth fill:#BD10E0
    style DB fill:#50E3C2
    style Email fill:#FF6B6B
    style FileStorage fill:#FFD700
    style Scheduler fill:#9013FE
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User as User/Browser
    participant Frontend as React Frontend
    participant API as Express API
    participant DB as Database
    participant Auth as Auth Service
    
    User->>Frontend: Enter Login Credentials
    Frontend->>API: POST /auth/login
    API->>Auth: Validate Credentials
    Auth->>DB: Check User Exists
    DB-->>Auth: User Found
    Auth->>Auth: Compare Password (bcrypt)
    Auth->>Auth: Generate JWT Tokens
    Auth-->>API: Return Access & Refresh Tokens
    API->>DB: Store Refresh Token Hash
    API-->>Frontend: Return Tokens + User Data
    Frontend->>Frontend: Save Tokens (localStorage)
    Frontend-->>User: Redirect to Dashboard
    
    Note over User,DB: Subsequent Requests
    User->>Frontend: Request Protected Resource
    Frontend->>API: Include Access Token in Header
    API->>Auth: Verify JWT Token
    Auth-->>API: Token Valid
    API->>DB: Fetch Resource
    DB-->>API: Return Data
    API-->>Frontend: Return Protected Data
    Frontend-->>User: Render Data
```

## Task Management Flow

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Frontend as Frontend App
    participant API as Backend API
    participant TaskSvc as Task Service
    participant NotifSvc as Notification Service
    participant DB as Database
    
    Admin->>Frontend: Create New Task
    Frontend->>API: POST /tasks {title, desc, assignee}
    API->>TaskSvc: Create Task
    TaskSvc->>DB: Save Task Record
    DB-->>TaskSvc: Task Created
    TaskSvc->>NotifSvc: Emit TASK_ASSIGNED Event
    NotifSvc->>DB: Create Notification
    NotifSvc->>API: Send Email Alert
    API-->>Frontend: Task Created (200 OK)
    Frontend-->>Admin: Show Success Message
    
    Note over Admin,DB: Task Assignment Process
    Admin->>Frontend: Click "Assign Task"
    Frontend->>API: PUT /tasks/:id {assignedToId}
    API->>TaskSvc: Update Task Assignment
    TaskSvc->>DB: Update Task Status
    TaskSvc->>NotifSvc: Emit Assignment Change
    NotifSvc->>DB: Create New Notification
    API-->>Frontend: Assignment Updated
    Frontend-->>Admin: Refresh Task List
    
    Note over Admin,DB: Employee Completes Task
    participant Employee as Employee User
    Employee->>Frontend: Update Task Status
    Frontend->>API: PUT /tasks/:id {status: COMPLETED}
    API->>TaskSvc: Mark Task Complete
    TaskSvc->>DB: Update Task
    TaskSvc->>NotifSvc: Emit TASK_COMPLETED
    NotifSvc->>DB: Create Completion Notification
    API-->>Frontend: Task Updated
    Frontend-->>Employee: Refresh Dashboard
```

## Notification Scheduler Flow

```mermaid
graph LR
    Scheduler["Task Scheduler<br/>Runs Every Minute"]
    CheckDB["Check Database<br/>for Tasks Due<br/>in 24 Hours"]
    NotifSvc["Notification Service"]
    EmailSvc["Email Service"]
    Users["Send Alerts to<br/>Assigned Users"]
    UpdateDB["Mark Notification<br/>as Sent"]
    
    Scheduler -->|Query| CheckDB
    CheckDB -->|Get Due Tasks| NotifSvc
    NotifSvc -->|Compose Message| EmailSvc
    EmailSvc -->|Send Email| Users
    EmailSvc -->|Update Status| UpdateDB
    
    style Scheduler fill:#FF6B6B
    style CheckDB fill:#F5A623
    style NotifSvc fill:#BD10E0
    style EmailSvc fill:#7ED321
    style Users fill:#4A90E2
    style UpdateDB fill:#50E3C2
```

## Data Flow Diagram

```mermaid
graph TB
    UI["User Interface<br/>(React Components)"]
    Redux["Redux Store<br/>(State Management)"]
    API["API Client<br/>(HTTP Module)"]
    Routes["API Routes<br/>(Express)"]
    Middleware["Middleware Stack<br/>(Auth, Validation, Error)"]
    Controllers["Controllers<br/>(Request Handlers)"]
    Services["Services<br/>(Business Logic)"]
    Prisma["Prisma ORM"]
    DB[(MySQL Database)]
    
    UI -->|Dispatch Actions| Redux
    Redux -->|Selectors| UI
    Redux -->|API Calls| API
    API -->|HTTP Requests| Routes
    Routes -->|Route Matching| Middleware
    Middleware -->|Valid Request| Controllers
    Controllers -->|Fetch/Modify Data| Services
    Services -->|Query Builder| Prisma
    Prisma -->|SQL| DB
    DB -->|Result Set| Prisma
    Prisma -->|Data| Services
    Services -->|Response| Controllers
    Controllers -->|JSON| API
    API -->|Success/Error| Redux
    Redux -->|State Change| UI
    
    style UI fill:#7ED321
    style Redux fill:#4A90E2
    style API fill:#F5A623
    style Routes fill:#FF6B6B
    style Middleware fill:#BD10E0
    style Controllers fill:#9013FE
    style Services fill:#50E3C2
    style Prisma fill:#FFD700
    style DB fill:#D3D3D3
```

## User Role & Permission Flow

```mermaid
graph TD
    User["User Login"]
    GetRole["Extract Role<br/>from JWT Token"]
    
    subgraph Admin["ADMIN Permissions"]
        AdminTasks["✅ Create/Edit/Delete Tasks"]
        ManageUsers["✅ Manage Users"]
        ViewReports["✅ View All Reports"]
        AssignTasks["✅ Assign Tasks"]
    end
    
    subgraph Employee["EMPLOYEE Permissions"]
        ViewOwnTasks["✅ View Assigned Tasks"]
        UpdateStatus["✅ Update Task Status"]
        ViewOwnReports["✅ View Own Reports"]
    end
    
    subgraph Denied["❌ Denied Actions"]
        DenyUserMgmt["❌ Cannot Manage Users"]
        DenyTaskCreate["❌ Cannot Assign Tasks"]
        DenyOthersData["❌ Cannot View Others Data"]
    end
    
    User -->|JWT Token| GetRole
    GetRole -->|role: ADMIN| Admin
    GetRole -->|role: EMPLOYEE| Employee
    Employee -->|Try Admin Action| Denied
    
    style User fill:#4A90E2
    style GetRole fill:#F5A623
    style Admin fill:#7ED321
    style Employee fill:#50E3C2
    style Denied fill:#FF6B6B
```

## Component Architecture

```mermaid
graph TD
    App["App.jsx<br/>(Root Component)"]
    
    subgraph Layout["Layout Components"]
        AppShell["AppShell<br/>(Navbar + Sidebar)"]
    end
    
    subgraph Auth["Auth Feature"]
        LoginPage["LoginPage"]
        RegisterPage["RegisterPage"]
        authSlice["authSlice<br/>(Redux Store)"]
    end
    
    subgraph Dashboard["Dashboard Feature"]
        DashboardPage["DashboardPage"]
        StatCard["StatCard Components"]
    end
    
    subgraph Tasks["Tasks Feature"]
        TasksPage["TasksPage"]
        TaskFormPage["TaskFormPage"]
        TaskTable["Task Table"]
    end
    
    subgraph Employees["Employees Feature"]
        EmployeesPage["EmployeesPage"]
        EmployeeFormPage["EmployeeFormPage"]
    end
    
    subgraph Reports["Reports Feature"]
        ReportsPage["ReportsPage"]
        Charts["Chart Components"]
    end
    
    subgraph Shared["Shared Components"]
        FormField["FormField"]
        PasswordField["PasswordField"]
        ConfirmDialog["ConfirmDialog"]
        Spinner["Spinner"]
        Badge["Badge"]
    end
    
    subgraph Services["Services"]
        Redux["Redux Store"]
        API["API Client"]
    end
    
    App --> Layout
    App --> Auth
    App --> Dashboard
    App --> Tasks
    App --> Employees
    App --> Reports
    App --> Shared
    Shared --> Services
    Dashboard --> Shared
    Tasks --> Shared
    Employees --> Shared
    Reports --> Shared
    
    style App fill:#4A90E2
    style Layout fill:#7ED321
    style Auth fill:#F5A623
    style Dashboard fill:#50E3C2
    style Tasks fill:#BD10E0
    style Employees fill:#9013FE
    style Reports fill:#FFD700
    style Shared fill:#D3D3D3
    style Services fill:#FF6B6B
```

## Database Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ TASK : "assigned"
    USER ||--o{ NOTIFICATION : receives
    TASK ||--o{ ATTACHMENT : contains
    TASK ||--o{ NOTIFICATION : triggers
    
    USER {
        string id PK
        string fullName
        string email UK
        string password
        enum role
        string department
        string designation
        datetime createdAt
        datetime updatedAt
    }
    
    REFRESH_TOKEN {
        string id PK
        string tokenHash UK
        string userId FK
        datetime createdAt
        datetime expiresAt
        datetime revokedAt
        string replacedByHash
        string ip
        string userAgent
        boolean rememberMe
    }
    
    TASK {
        string id PK
        string title
        text description
        enum priority
        enum status
        datetime startDate
        datetime dueDate
        string assignedToId FK
        datetime createdAt
        datetime updatedAt
    }
    
    ATTACHMENT {
        string id PK
        string fileName
        string fileUrl
        string fileType
        int fileSize
        string taskId FK "UK"
        datetime uploadedAt
    }
    
    NOTIFICATION {
        string id PK
        string userId FK
        string taskId FK "optional"
        enum type
        string title
        text message
        boolean isRead
        datetime createdAt
    }
```

---

## Legend

- 🌐 = Web/Network
- ⚛️ = React/Frontend
- 🔌 = API/Backend
- 🔐 = Security/Authentication
- 💾 = Database
- 📧 = Email Service
- 📁 = File Storage
- ⏰ = Scheduler/Time-based

