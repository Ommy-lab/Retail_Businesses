frontend/
├── public/
├── src/
│   ├── assets/              # Static images, logos, placeholders
│   ├── components/          # Reusable UI elements
│   │   ├── common/          # Buttons, Modals, Inputs, Cards
│   │   ├── layout/          # Navbar, Sidebar, AppLayout
│   │   └── tables/          # DataTables for transactions and reports
│   ├── context/
│   │   └── AuthContext.jsx  # Global session and role management
│   ├── hooks/               # Custom React hooks (e.g., useAuth, useFetch)
│   ├── pages/
│   │   ├── admin/           # Super Admin Views
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── BusinessManager.jsx
│   │   ├── business/        # Business Tenant Views
│   │   │   ├── BusinessDashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   └── auth/
│   │       └── Login.jsx
│   ├── services/
│   │   └── api.js           # Axios client configuration
│   ├── utils/               # Formatters (currency, date, profit calculations)
│   ├── App.jsx              # Main routing tree
│   ├── index.css            # Tailwind CSS imports and global styles
│   └── main.jsx             # React DOM root entry