## Estructura del Proyecto

├─ Frontend
│  ├─ HTML
│  ├─ CSS
│  └─ JavaScript
│
├─ Backend
│  └─ Python
│
└─ Base de Datos
   └─ MySQL

## Arquitectura de los archivos en esta carpeta

/iso

├── assets/                → recursos estaticos y estilos compartidos
│   ├── css/               → estilos globales
│   │   └── estilo.css
│   ├── images/            → imagenes y logos
│   └── js/                → scripts globales
│
├────index.html
├── dashboard/                 → panel principal
├── clientes/                  → gestión de ( clientes + leads )
├── propiedades/               → gestión de inmuebles
├── asesores/                 → gestión de asesores
│
├── cna_clientes/             → customer network analysis (clientes + leads)
│   ├─ index.html             → inicio
│   ├─ network.html           → red
│   ├─ rankings.html          → rankings
│   ├─ communities.html       → comunidades
│   ├─ influence.html         → influencia
│   ├─ provider.html          → proveedor
│   └── assets/
│
├── cna_asesores/             → customer network analysis (asesores)
│   ├─ index.html             → inicio
│   ├─ network.html           → red
│   ├─ rankings.html          → rankings
│   ├─ communities.html       → comunidades
│   ├─ influence.html         → influencia
│   ├─ provider.html          → proveedor
│   └── assets/               → recursos estaticos
│
├── kpis/                      → métricas e indicadores
│   ├── clientes/              → (kpis clientes + kpis leads)
│   ├── propiedades/          → kpis propiedades
│   └── asesores/              → kpis asesores
│
├── database/               → base de datos MySQL
│   ├─ schema.sql           → definición de tablas
│   ├─ init.sql             → script de inicialización
│   └─ mysql_config.js      → configuración de MySQL
│
├── backend/                → API Rest (FastAPI Python)
│   ├─ requirements.txt     → dependencias de Python
│   ├─ main.py              → punto de entrada de la aplicación
│   ├─ database.py          → conexión y sesión de SQLAlchemy
│   ├─ models/
│   │  └─ models.py         → modelos ORM de la base de datos
│   ├─ schemas/
│   │  └─ schemas.py        → esquemas de validación de Pydantic
│   └─ routes/              → enrutadores y controladores de endpoints
│      ├─ clientes.py          → clientes (leads y clientes)
│      ├─ propiedades.py       → propiedades
│      ├─ asesores.py          → asesores
│      ├─ cna.py             → cna (customer network analysis)
│      ├─ kpis.py            → kpis (metrics and indicators)
│      └─ dashboard.py       → dashboard
│
├── .gitignore               → ignore files
└── vite.config.js           → vite configuration
