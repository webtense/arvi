module.exports = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'Credenciales incorrectas',
  AUTH_TOKEN_REQUIRED: 'Token de autenticación requerido',
  AUTH_TOKEN_INVALID: 'Token inválido o expirado',
  AUTH_FORBIDDEN: 'No tienes permiso para acceder a este recurso',
  AUTH_USER_NOT_FOUND: 'Usuario no encontrado',
  AUTH_USER_ALREADY_EXISTS: 'El usuario ya existe',
  AUTH_WEAK_PASSWORD: 'La contraseña debe tener al menos 8 caracteres',

  // Client errors
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  CLIENT_CIF_EXISTS: 'Ya existe un cliente con este CIF/NIF',
  CLIENT_NAME_REQUIRED: 'El nombre del cliente es obligatorio',
  CLIENT_HAS_INVOICES: 'No se puede eliminar el cliente porque tiene facturas asociadas',

  // Invoice errors
  INVOICE_NOT_FOUND: 'Factura no encontrada',
  INVOICE_ALREADY_FINALIZED: 'La factura ya está finalizada',
  INVOICE_ALREADY_CANCELLED: 'La factura ya está cancelada',
  INVOICE_FINALIZE_DRAFT_ONLY: 'Solo se pueden finalizar facturas en borrador',
  INVOICE_CANCEL_FINALIZED_ONLY: 'Solo se pueden cancelar facturas finalizadas',
  INVOICE_INVALID_NUMBER: 'Número de factura inválido',
  INVOICE_ITEMS_REQUIRED: 'La factura debe tener al menos una línea',

  // Budget errors
  BUDGET_NOT_FOUND: 'Presupuesto no encontrado',
  BUDGET_ALREADY_SENT: 'El presupuesto ya ha sido enviado',
  BUDGET_ALREADY_ACCEPTED: 'El presupuesto ya ha sido aceptado',
  BUDGET_ALREADY_REJECTED: 'El presupuesto ya ha sido rechazado',
  BUDGET_INVALID_NUMBER: 'Número de presupuesto inválido',

  // Part errors
  PART_NOT_FOUND: 'Parte no encontrado',
  PART_INVALID_NUMBER: 'Número de parte inválido',

  // Asset errors
  ASSET_NOT_FOUND: 'Activo no encontrado',
  ASSET_SERIAL_EXISTS: 'Ya existe un activo con este número de serie',

  // Ticket errors
  TICKET_NOT_FOUND: 'Ticket no encontrado',
  TICKET_ALREADY_CLOSED: 'El ticket ya está cerrado',

  // General errors
  SERVER_ERROR: 'Error en el servidor',
  INVALID_INPUT: 'Datos de entrada inválidos',
  NOT_FOUND: 'Recurso no encontrado',
  METHOD_NOT_ALLOWED: 'Método no permitido',
  VALIDATION_ERROR: 'Error de validación',

  // Validation messages
  FIELD_REQUIRED: (field) => `El campo ${field} es obligatorio`,
  FIELD_INVALID: (field) => `El campo ${field} tiene un formato inválido`,
  FIELD_MIN_LENGTH: (field, min) => `El campo ${field} debe tener al menos ${min} caracteres`,
  FIELD_MAX_LENGTH: (field, max) => `El campo ${field} debe tener como máximo ${max} caracteres`,
};