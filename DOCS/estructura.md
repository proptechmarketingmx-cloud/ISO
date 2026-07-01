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

├── assets/                        → recursos estáticos y estilos compartidos
│   ├── css/
│   │   └── estilo.css             → estilos globales
│   └── js/
│       ├── api.js                 → cliente HTTP base
│       ├── nav.js                 → navegación y sidebar
│       └── utils.js               → utilidades compartidas
│
├── index.html                     → entrada principal de la app
│
├── dashboard/
│   └── index.html                 → panel principal con métricas generales
│
├── clientes/                      → gestión de clientes + leads
│   ├── index.html
│   └── js/
│       ├── main.js                → lógica principal del módulo
│       └── components/
│           ├── ClienteForm.js     → formulario de alta/edición
│           ├── ClienteTable.js    → tabla de listado
│           ├── ExpedienteView.js  → vista de expediente
│           └── api.js             → llamadas API del módulo
│
├── propiedades/
│   └── index.html                 → gestión de inmuebles
│
├── asesores/
│   └── index.html                 → gestión de asesores
│
├── cna_clientes/                  → customer network analysis (clientes + leads)
│   ├── index.html                 → inicio
│   ├── network.html               → red
│   ├── rankings.html              → rankings
│   ├── communities.html           → comunidades
│   ├── influence.html             → influencia
│   └── provider.html              → proveedor
│
├── cna_asesores/                  → customer network analysis (asesores)
│   ├── index.html                 → inicio
│   ├── network.html               → red
│   ├── rankings.html              → rankings
│   ├── communities.html           → comunidades
│   ├── influence.html             → influencia
│   └── provider.html              → proveedor
│
├── kpis/                          → métricas e indicadores
│   ├── clientes/
│   │   └── index.html             → kpis clientes + leads
│   ├── propiedades/
│   │   └── index.html             → kpis propiedades
│   └── asesores/
│       └── index.html             → kpis asesores
│
├── database/                      → base de datos MySQL
│   ├── schema.sql                 → definición de tablas
│   ├── init.sql                   → script de inicialización
│   └── mysql_config.js            → configuración de MySQL
│
├── docs/
│      ├──  api.md                 → documentación de la API REST (endpoints, modelos, respuestas)
│      ├──  arquitectura.md        → documentación de la arquitectura del sistema
│      ├──  cna.md                 → documentación del Customer Network Analysis
│      ├──  formularios.md         → documentación de los formularios
│      ├──  estructura.md          → documentación de la estructura del proyecto
│      ├──  modelo_datos.md        → documentación del modelo de datos
│      ├──  readme.md              → documentación del proyecto
│      └──  reglas.md              → documentación de las reglas de negocio
│

│
├── backend/                       → API Rest (FastAPI + Python)
│   ├── Dockerfile                 → imagen Docker del backend
│   ├── requirements.txt           → dependencias de Python
│   ├── main.py                    → punto de entrada de la aplicación
│   ├── database.py                → conexión y sesión de SQLAlchemy
│   ├── models/
│   │   ├── models.py              → modelos ORM generales
│   │   └── cliente.py             → modelos ORM de clientes
│   ├── schemas/
│   │   ├── schemas.py             → esquemas de validación Pydantic (general)
│   │   └── cliente.py             → esquemas de clientes
│   ├── services/
│   │   ├── cliente_service.py     → lógica de negocio de clientes
│   │   └── delete_validations.py  → validaciones de eliminación
│   └── routes/
│       ├── cliente_routes.py      → endpoints de clientes
│       ├── propiedades.py         → endpoints de propiedades
│       ├── asesores.py            → endpoints de asesores
│       ├── cna.py                 → endpoints de customer network analysis
│       ├── kpis.py                → endpoints de kpis
│       └── dashboard.py           → endpoints de dashboard
│
├── test_clientes_api.py           → tests de la API de clientes
├── Dockerfile                     → imagen Docker raíz
├── docker-compose.yml             → orquestación de servicios
├── nginx.conf                     → configuración de Nginx
├── vite.config.js                 → configuración de Vite
├── package.json                   → dependencias frontend
├── .env.example                   → variables de entorno de ejemplo
└── .gitignore                     → archivos ignorados por git
