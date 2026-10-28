/* ── Shared atomic labels ── */
export const labels = {
  table: {
    symbol: 'Símbolo',
    company: 'Empresa',
    price: 'Precio',
    variation: 'Variación',
    quantity: 'Cantidad',
    reserved: 'Reservadas',
    side: 'Lado',
    type: 'Modalidad',
    status: 'Estado',
    created: 'Creada',
    date: 'Fecha',
    name: 'Nombre',
    email: 'Email',
    user: 'Usuario',
    avgCost: 'Costo promedio',
    currentPrice: 'Precio actual',
    value: 'Valor',
    pL: 'P/L',
    limit: 'Límite',
    commission: 'Comisión',
    net: 'Neto',
  },
  action: {
    buy: 'Compra',
    sell: 'Venta',
    market: 'Mercado',
    limit: 'Límite',
    add: 'Agregar',
    remove: 'Quitar',
    accept: 'Aceptar',
    delete: 'Eliminar',
    save: 'Guardar cambios',
    saving: 'Guardando...',
    send: 'Enviar solicitud',
    sending: 'Enviando...',
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    logout: 'Cerrar sesión',
    goToDashboard: 'Ir al panel',
    backToLogin: 'Iniciar sesión',
    changePassword: 'Cambiar contraseña',
    changingPassword: 'Cambiando...',
    changeEmail: 'Cambiar correo',
    changingEmail: 'Cambiando...',
    createOrder: 'Crear orden',
    creatingOrder: 'Creando orden...',
    demoMode: 'Modo demo',
    loggingIn: 'Ingresando...',
    enterQuill: 'Entrar a Quill',
    creatingAccount: 'Creando cuenta...',
    byShares: 'Por cantidad',
    byAmount: 'Por monto',
    guardarCambios: 'Guardar cambios',
  },
  field: {
    fullName: 'Nombre completo',
    username: 'Nombre de usuario',
    usernamePlaceholder: 'user_XXXXXX',
    email: 'Correo',
    password: 'Contraseña',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar contraseña',
    currentPassword: 'Contraseña actual',
    symbol: 'Acción',
    quantity: 'Cantidad',
    limitPrice: 'Precio límite (CLP)',
    investAmount: 'Monto a invertir (CLP)',
    userId: 'ID de usuario',
  },
  password: {
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
  },
} as const

/* ── Dashboard ── */
export const dashboard = {
  title: 'Panel principal',
  subtitle:
    'Lee el mercado, registra órdenes y sigue tu aprendizaje con una vista equilibrada y clara.',
  loading: 'Cargando datos de Quill...',
  hero: {
    eyebrow: 'Quill en tiempo real',
    fallbackTitle: 'Mercado en seguimiento',
    description:
      'El mercado mock actualiza precios y órdenes periódicamente para que practiques lectura de contexto, entradas con límite y gestión del portafolio.',
    chips: {
      brand: 'Marca principal: Quill',
      team: 'Equipo desarrollador: Atelynx',
    },
  },
  summaryCards: {
    availableBalance: 'Saldo disponible',
    investedCapital: 'Capital invertido',
    totalEquity: 'Patrimonio total',
    unrealizedPnl: 'Resultado no realizado',
    openOrders: 'Órdenes abiertas',
  },
  marketStatus: {
    open: 'Mercado abierto',
    closed: 'Mercado cerrado',
    hours: (open: string, close: string) => `${open} – ${close} hrs`,
    closesIn: 'Cierra en',
    opensIn: 'Abre en',
    resumesAt: (time: string) => `Reabre a las ${time}`,
  },
  sections: {
    topMovers: {
      title: 'Movimiento destacado del mercado',
      description:
        'Estas acciones muestran la variación diaria más visible del simulador.',
    },
    chart: {
      description: (_symbol: string, price: string) =>
        `Precio actual ${price}. Selecciona otra acción en la tabla para cambiar la vista.`,
      fallbackDescription: 'Selecciona una acción para revisar su evolución.',
    },
    orderForm: {
      title: 'Nueva orden limitada',
      description:
        'Define el precio al que quieres entrar o salir. Quill la ejecutará automáticamente cuando el mercado llegue a ese valor.',
    },
    marketTable: {
      title: 'Mercado disponible',
      description:
        'Haz clic en una acción para enfocarte en su gráfica y preparar una orden.',
    },
    guide: {
      title: 'Cómo leer este panel',
      description: 'Ayudas rápidas para usuarios que recién comienzan.',
      cards: [
        {
          title: 'Saldo disponible',
          text: 'Es el capital que aún puedes usar para nuevas órdenes.',
        },
        {
          title: 'Orden limitada',
          text: 'No se ejecuta al instante: espera hasta que el mercado alcance tu precio objetivo.',
        },
        {
          title: 'Resultado no realizado',
          text: 'Muestra la ganancia o pérdida estimada de posiciones que aún no has vendido.',
        },
      ],
    },
    portfolio: {
      title: 'Portafolio',
      description: 'Tus posiciones activas, costo promedio y valor de mercado actual.',
    },
    openOrders: {
      title: 'Órdenes abiertas',
      description:
        'Quedarán aquí mientras esperan que el precio cumpla tu condición.',
    },
    recentTrades: {
      title: 'Operaciones recientes',
      description:
        'Registro de compras y ventas ya ejecutadas por el motor del simulador.',
    },
  },
} as const

/* ── Portfolio ── */
export const portfolio = {
  emptyTitle: 'Tu portafolio todavía está vacío',
  emptyDescription:
    'Cuando compres una acción ejecutada, Quill mostrará aquí tu cantidad, costo promedio y resultado no realizado.',
  usernameLabel: 'Nombre de usuario',
  emailLabel: 'Email',
} as const

/* ── Orders table ── */
export const ordersTable = {
  emptyTitle: 'Todavía no hay órdenes abiertas',
  emptyDescription:
    'Tus órdenes pendientes aparecerán aquí apenas registres una compra o venta limitada.',
} as const

/* ── Trades table ── */
export const tradesTable = {
  emptyTitle: 'Aún no hay operaciones ejecutadas',
  emptyDescription:
    'Tus compras y ventas ejecutadas quedarán registradas aquí con precio, comisión y monto neto.',
} as const

/* ── Order form ── */
export const orderForm = {
  demoDisabled: 'La creación de órdenes está deshabilitada en modo demo.',
  demoHint:
    'Estás en modo demo. Puedes revisar el formulario, pero crear órdenes está deshabilitado.',
  invalidPrice: 'Precio inválido. Verifica los datos.',
  insufficientAmount: (price: string) =>
    `Monto insuficiente. Debe ser al menos ${price} para comprar 1 acción.`,
  insufficientQuantity: 'El monto ingresado no es suficiente para comprar al menos 1 acción.',
  orderExecuted: 'Orden ejecutada al precio de mercado.',
  orderRegistered:
    'Orden registrada. Quedará pendiente hasta que el mercado cumpla la condición.',
  currentPrice: 'Precio actual',
  selectStock: 'Selecciona una acción para continuar.',
  limitPriceLabel: 'Precio límite (CLP)',
  costEstimate: 'Costo total estimado:',
  description: {
    market: 'La orden se ejecutará de inmediato al precio actual del mercado.',
    buy:
      'La compra se ejecuta cuando el mercado cae al precio límite o por debajo.',
    sell:
      'La venta se ejecuta cuando el mercado sube al precio límite o por encima.',
  },
  errorFallback: 'No fue posible registrar la orden.',
} as const

/* ── Watchlist ── */
export const watchlist = {
  title: 'Lista de seguimiento',
  subtitle: 'Tus acciones favoritas.',
  subtitleDetail: 'Acciones que sigues de cerca.',
  loading: 'Cargando lista de seguimiento...',
  favorites: {
    title: 'Tus favoritos',
    emptyHint: 'Agrega acciones desde el panel principal.',
  },
  counter: (n: number) => `${n} acciones en seguimiento`,
  empty: {
    title: 'Sin seguimiento',
    description:
      'Selecciona acciones como favoritas desde la tabla del mercado en el Dashboard.',
  },
  addSection: {
    title: 'Agregar acciones',
    description: 'Acciones disponibles que no estás siguiendo.',
  },
} as const

/* ── Settings ── */
export const settings = {
  page: {
    title: 'Configuración de perfil',
    subtitle: 'Administra tu información personal, correo y contraseña.',
  },
  profileInfo: {
    title: 'Información de la cuenta',
    name: 'Nombre',
    username: 'Nombre de usuario',
    email: 'Correo',
    balance: 'Saldo disponible',
  },
  editProfile: {
    title: 'Editar perfil',
    description: 'Actualiza tu nombre y nombre de usuario público.',
    success: 'Perfil actualizado correctamente.',
    error: 'No se pudo actualizar el perfil.',
  },
  changeEmail: {
    title: 'Cambiar correo',
    description:
      'Recibirás un aviso. Después de cambiar el correo tendrás que iniciar sesión de nuevo.',
    newEmail: 'Nuevo correo',
    confirmHint: 'Confirma tu identidad con tu contraseña actual.',
    success: 'Correo actualizado. Inicia sesión de nuevo.',
    error: 'No se pudo cambiar el correo.',
  },
  changePassword: {
    title: 'Cambiar contraseña',
    description:
      'Usa una contraseña segura. Después de cambiarla tendrás que iniciar sesión de nuevo.',
    currentHint: 'Tu contraseña actual para confirmar tu identidad.',
    newHint: 'Debe tener al menos 8 caracteres.',
    confirmHint: 'Debe coincidir con la nueva contraseña.',
    success: 'Contraseña actualizada. Inicia sesión de nuevo.',
    error: 'No se pudo cambiar la contraseña.',
  },
} as const

/* ── Auth page ── */
export const auth = {
  loading: 'Cargando…',
  hero: {
    eyebrow: 'Atelynx presenta',
    title: 'Quill',
    subtitle: 'Quill • Simulador educativo',
    headline: 'Aprende a invertir entendiendo cada decisión.',
    description:
      'Quill combina mercado simulado, órdenes límite, comisiones y portafolio para practicar con una experiencia clara, seria y sin dinero real.',
    metrics: [
      {
        title: 'Registro seguro y directo',
        text: 'Crea tu cuenta y entra manualmente cuando estés listo.',
      },
      {
        title: 'Mercado con actividad',
        text: 'Precios, gráficas y actualizaciones con sensación de flujo.',
      },
      {
        title: 'Aprendizaje guiado',
        text: 'Quill explica lo importante sin llenar la pantalla de ruido.',
      },
    ],
  },
  tabAriaLabel: 'Cambiar formulario',
  login: {
    title: 'Iniciar sesión',
    passwordHint: 'Usa la contraseña con la que creaste tu cuenta.',
    error: 'No fue posible iniciar sesión. Revisa tus credenciales.',
    emailLabel: 'Correo',
    passwordLabel: 'Contraseña',
  },
  register: {
    title: 'Crear cuenta',
    passwordHint: 'Usa al menos 8 caracteres.',
    confirmHint: 'Debe coincidir exactamente con la contraseña principal.',
    error: 'No fue posible crear tu cuenta. Verifica los datos.',
    usernameLabel: 'Nombre de usuario',
    emailLabel: 'Correo',
    passwordLabel: 'Contraseña',
  },
  footer:
    'Quill no usa dinero real. El acceso al dashboard requiere iniciar sesión manualmente después de crear tu cuenta.',
} as const

/* ── Friends ── */
export const friends = {
  title: 'Amigos',
  subtitle: 'Conecta con otros usuarios de Quill.',
  subtitleShort: 'Gestiona tus amigos.',
  loading: 'Cargando amigos...',
  search: {
    title: 'Agregar amigo',
    description: 'Busca por ID de usuario para enviar una solicitud.',
    success: 'Solicitud enviada correctamente.',
    error: 'No se pudo enviar la solicitud.',
  },
  requests: {
    title: 'Solicitudes pendientes',
    count: (n: number) => `${n} solicitud(es) por revisar.`,
  },
  list: {
    title: 'Tus amigos',
    empty: 'Aún no tienes amigos.',
    emptyTitle: 'Sin amigos',
    emptyDescription: 'Envía solicitudes a otros usuarios para empezar.',
    count: (n: number) => `${n} amigo(s)`,
  },
} as const

/* ── App shell ── */
export const appShell = {
  brandEyebrow: 'Atelynx',
  brandTitle: 'Quill',
  brandDescription:
    'Simulador educativo de inversión para practicar decisiones con datos dinámicos, comisiones y órdenes límite.',
  account: 'Cuenta activa',
  nav: {
    dashboard: 'Dashboard',
    watchlist: 'Seguimiento',
    friends: 'Amigos',
    contests: 'Concursos',
    settings: 'Configuración',
  },
  focus: {
    title: 'Enfoque de Quill',
    items: [
      'Practica sin riesgo financiero real.',
      'Observa cómo se ejecuta una orden límite.',
      'Aprende leyendo tu portafolio y tus operaciones.',
    ],
  },
  header: {
    eyebrow: 'Plataforma Quill',
  },
} as const

/* ── Admin ── */
export const admin = {
  nav: 'Admin',
  title: 'Panel de administración',
  subtitle: 'Gestiona las configuraciones y respaldos del sistema.',
  config: {
    title: 'Configuraciones',
    description: 'Gestiona las configuraciones del sistema.',
    create: 'Nueva configuración',
    edit: 'Editar configuración',
    delete: 'Eliminar configuración',
    deleteConfirm: 'Esta acción eliminará permanentemente esta configuración y todo su historial.',
    restartWarning: 'Requiere reinicio del servidor',
    history: 'Historial de cambios',
    fields: {
      key: 'Clave',
      name: 'Nombre',
      value: 'Valor',
      tags: 'Etiquetas',
      inUse: 'Activa',
      lastUsed: 'Último uso',
      status: 'Estado',
      actions: 'Acciones',
      effectiveValue: 'Valor efectivo',
      appliesOn: 'Aplica en',
    },
    tags: {
      active: 'Activa',
      inactive: 'Inactiva',
    },
    empty: 'No hay configuraciones disponibles.',
  },
  snapshots: {
    title: 'Respaldos',
    description: 'Administra los respaldos de configuración.',
    create: 'Crear respaldo',
    createName: 'Nombre del respaldo (opcional)',
    restore: 'Restaurar respaldo',
    restoreConfirm: '¿Estás seguro de que deseas restaurar este respaldo? Se creará un respaldo de auditoría antes de la restauración.',
    view: 'Ver detalles',
    empty: 'No hay respaldos disponibles.',
    restoreSuccess: 'Respaldo restaurado correctamente.',
    createdSuccess: 'Respaldo creado correctamente.',
  },
  stocks: {
    title: 'Acciones',
    description: 'Gestiona las acciones del simulador.',
    create: 'Nueva acción',
    editPrice: 'Actualizar precio',
    fields: {
      symbol: 'Símbolo',
      name: 'Nombre',
      price: 'Precio',
      dayChange: 'Var. %',
      source: 'Origen',
      volume: 'Volumen',
      currency: 'Moneda',
    },
    sources: {
      admin: 'Admin',
      mock: 'Simulación',
      eodhd: 'Proveedor',
    },
    empty: 'No hay acciones disponibles.',
    createTitle: 'Crear nueva acción',
    updatePriceTitle: 'Actualizar precio',
    updatePriceWarning: 'La próxima actualización del proveedor sobrescribirá este valor.',
    deleteConfirm: '¿Eliminar acción "{symbol}"?',
    notDeletable: 'No se puede eliminar una acción del proveedor.',
    saved: 'Acción creada correctamente.',
    priceUpdated: 'Precio actualizado correctamente.',
    deleted: 'Acción eliminada correctamente.',
  },
  contests: {
    title: 'Concursos',
    description: 'Crea y administra los concursos de inversión.',
    create: 'Crear concurso',
    createTitle: 'Crear concurso',
    empty: 'Aún no hay concursos',
    loading: 'Cargando concursos...',
    loadError: 'No fue posible cargar los concursos.',
    createError: 'Error al crear el concurso.',
    saved: 'Concurso creado correctamente.',
    fields: {
      name: 'Nombre',
      description: 'Descripción (opcional)',
      mode: 'Modalidad',
      accountTypes: 'Cuentas',
      initialBalance: 'Saldo inicial (CLP)',
      startDate: 'Inicio',
      endDate: 'Término',
      status: 'Estado',
      participants: 'Inscritos',
    },
    placeholders: {
      name: 'Copa Quill 2026',
      description: 'Describe brevemente el concurso',
    },
    modes: {
      INDIVIDUAL: 'Individual',
      TEAM: 'Por equipos',
    },
    accountTypes: {
      UNIVERSITY: 'Universidad',
      EXTERNAL: 'Externa',
    },
    statuses: {
      UPCOMING: 'Próximo',
      ACTIVE: 'Activo',
      FINISHED: 'Finalizado',
    },
  },
  actions: {
    edit: 'Editar',
    delete: 'Eliminar',
    history: 'Historial',
    cancel: 'Cancelar',
    save: 'Guardar',
    creating: 'Creando...',
    saving: 'Guardando...',
  },
} as const

/* ── Contests (student) ── */
export const contests = {
  title: 'Concursos',
  subtitle: 'Revisa los concursos de inversión e inscríbete para participar.',
  listTitle: 'Concursos disponibles',
  loading: 'Cargando concursos...',
  loadError: 'No fue posible cargar los concursos.',
  empty: {
    title: 'No hay concursos disponibles por ahora',
    description: 'Cuando se publique un concurso, aparecerá aquí.',
  },
  fields: {
    mode: 'Modalidad',
    dates: 'Fechas',
    initialBalance: 'Saldo inicial',
  },
  participants: (count: number) => `${count} ${count === 1 ? 'inscrito' : 'inscritos'}`,
  dateRange: (start: string, end: string) => `${start} - ${end}`,
  actions: {
    enroll: 'Inscribirme',
    enrolling: 'Inscribiendo...',
    finished: 'Finalizado',
    team: 'Por equipos (próximamente)',
  },
  enrolled: 'Inscrito',
  enrollSuccess: (name: string) => `Te inscribiste en ${name}`,
  enrollError: 'No fue posible inscribirte en el concurso.',
} as const

/* ── Error boundary ── */
export const errorBoundary = {
  title: 'Oops! Algo salió mal',
  description: 'Disculpa, encontramos un error inesperado en la aplicación.',
  detailsSummary: 'Detalles del error (para desarrolladores)',
  reload: 'Recargar página',
} as const

/* ── 404 ── */
export const notFound = {
  title: '404',
  description: 'No pudimos encontrar la ruta solicitada.',
} as const

/* ── Currency selector ── */
export const currencySelector = {
  ariaLabel: (currency: string) =>
    `Moneda actual: ${currency}. Cambiar moneda.`,
} as const

/* ── Validation messages ── */
export const validation = {
  required: (field: string) => `${field} es obligatorio.`,
  email: 'Ingresa un correo válido.',
  passwordMin: 'La contraseña debe tener al menos 8 caracteres.',
  passwordConfirm:
    'Confirma la contraseña con al menos 8 caracteres.',
  passwordsMustMatch: 'Las contraseñas deben coincidir.',
  fullName: 'Ingresa tu nombre completo.',
  username: 'Solo letras, números y guion bajo.',
  newPasswordMin: 'La nueva contraseña debe tener al menos 8 caracteres.',
} as const
