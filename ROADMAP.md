# 🧠 ROADMAP DE APRENDIZAJE - Business Manager Back

> Roadmap estructurado basado en el proyecto actual para crecimiento profesional en NestJS y desarrollo backend.

---

## 📊 Estado Actual

### ✅ Ya dominas

- CRUD con Prisma
- DTOs básicos con class-transformer
- Respuestas API consistentes
- Filtros dinámicos
- Paginación básica
- Promise.all para optimización
- Mappers de datos
- Transacciones de Prisma
- Validaciones de negocio (stock, existencia)
- Cálculo con Prisma.Decimal
- Relaciones en Prisma
- Estados de orden (state machine)
- Helpers y separación de lógica

### ❌ Te falta para nivel profesional

- class-validator (validación de inputs)
- Testing (unit tests, mocks)
- Arquitectura limpia (use cases, repositories)
- Manejo de errores global (ExceptionFilter)
- Logging profesional
- Performance (índices, N+1 queries)
- Casos de negocio avanzados
- Seguridad básica

---

## 🎯 ROADMAP ESTRUCTURADO

### 🔹 FASE 1: Fundamentos Sólidos (2-3 semanas)

#### Semana 1: Validación Robusta

**Objetivo:** Reemplazar validaciones manuales con class-validator

- [ ] **class-validator basics**
  - Decoradores: `@IsString()`, `@IsUUID()`, `@IsNumber()`, `@IsOptional()`
  - Validaciones anidadas en DTOs
  - Custom validators

- [ ] **Aplicar a DTOs existentes**
  - `CreateOrderDto` - validar items array
  - `CreateProductDto` - validar price positivo
  - `CreateCustomerDto` - validar email

- [ ] **Pipe de validación global**
  - Configurar ValidationPipe en main.ts
  - Manejo automático de errores de validación

**Recursos:**

- "NestJS class-validator tutorial"
- "DTO validation NestJS"

---

#### Semana 2: Testing Fundamentals

**Objetivo:** Escribir tests para OrdersService

- [ ] **Jest setup**
  - Configurar Jest para NestJS
  - Entender describe/it/expect

- [ ] **Unit tests simples**
  - Test `findAll` en OrdersService
  - Test `findOne` en OrdersService
  - Mock de PrismaService

- [ ] **Tests con transacciones**
  - Test `create` con mock de $transaction
  - Test `cancel` con mock de stock helper

**Recursos:**

- "NestJS testing service"
- "Jest mocking Prisma"

---

#### Semana 3: Manejo de Errores Global

**Objetivo:** Estandarizar respuestas de error

- [ ] **ExceptionFilter global**
  - Crear `HttpExceptionFilter`
  - Formato consistente de errores
  - Códigos de error estandarizados

- [ ] **Custom exceptions**
  - `NotFoundException` con código
  - `BadRequestException` con código
  - `ConflictException` para duplicados

- [ ] **Aplicar a todos los servicios**
  - Reemplazar throw manuales
  - Usar excepciones custom

**Recursos:**

- "NestJS ExceptionFilter"
- "Custom exceptions NestJS"

---

### 🔹 FASE 2: Arquitectura Limpia (3-4 semanas)

#### Semana 4: Desacoplar Prisma

**Objetivo:** Implementar pattern Repository

- [ ] **Repository pattern**
  - Crear `OrdersRepository`
  - Crear `ProductsRepository`
  - Crear `CustomersRepository`

- [ ] **Mover lógica de DB**
  - Queries de Prisma a repositories
  - Services usan repositories, no Prisma directo

- [ ] **Interface de Repository**
  - `IOrdersRepository`
  - Facilitar testing con mocks

**Recursos:**

- "Repository pattern NestJS"
- "Clean architecture NestJS"

---

#### Semana 5: Use Cases

**Objetivo:** Separar lógica de negocio de servicios

- [ ] **Crear Use Cases**
  - `CreateOrderUseCase`
  - `CancelOrderUseCase`
  - `CompleteOrderUseCase`

- [ ] **Mover lógica de negocio**
  - Validaciones a use cases
  - Cálculos a use cases
  - Services solo coordinan

- [ ] **Test de use cases**
  - Unit tests sin dependencias externas

**Recursos:**

- "Use case pattern"
- "Clean architecture use cases"

---

#### Semana 6: Logging Profesional

**Objetivo:** Reemplazar console.log con logging estructurado

- [ ] **Winston logger**
  - Configurar Winston en NestJS
  - Niveles: error, warn, info, debug

- [ ] **Logs estructurados**
  - Contexto en cada log
  - IDs de transacción
  - Timestamps consistentes

- [ ] **Eliminar console.log**
  - Buscar y reemplazar todos
  - Usar logger en services

**Recursos:**

- "NestJS Winston logger"
- "Structured logging best practices"

---

#### Semana 7: DTOs Avanzados

**Objetivo:** DTOs más robustos y reutilizables

- [ ] **Partial DTOs**
  - `UpdateOrderDto` con PartialType
  - `UpdateProductDto` con PartialType

- [ ] **Nested DTOs**
  - Validación de arrays en DTOs
  - DTOs anidados complejos

- [ ] **Transformación automática**
  - `@Transform` para conversión de tipos
  - `@Expose` y `@Exclude` avanzados

**Recursos:**

- "NestJS DTOs advanced"
- "class-transformer decorators"

---

### 🔹 FASE 3: Performance y Escalabilidad (2-3 semanas)

#### Semana 8: Optimización de Queries

**Objetivo:** Eliminar N+1 queries y mejorar performance

- [ ] **Identificar N+1 queries**
  - Analizar queries en logs
  - Usar Prisma logging

- [ ] **Optimizar includes**
  - `select` vs `include`
  - Cargar solo datos necesarios

- [ ] **Índices en DB**
  - Agregar índices en schema.prisma
  - Índices para foreign keys
  - Índices para campos de búsqueda

**Recursos:**

- "Prisma N+1 problem"
- "Database indexing Prisma"

---

#### Semana 9: Caching

**Objetivo:** Implementar caching para queries frecuentes

- [ ] **Redis setup**
  - Configurar Redis con NestJS
  - Cache manager

- [ ] **Caching de productos**
  - Cachear `findAll` de productos
  - Invalidar cache al actualizar

- [ ] **Caching de clientes**
  - Cachear `findOne` de clientes
  - TTL apropiado

**Recursos:**

- "NestJS Redis cache"
- "Caching strategies"

---

#### Semana 10: Paginación Avanzada

**Objetivo:** Mejorar paginación existente

- [ ] **Cursor-based pagination**
  - Para grandes datasets
  - Más eficiente que offset

- [ ] **Filtros avanzados**
  - Búsqueda por múltiples campos
  - Ordenamiento dinámico

- [ ] **Meta información**
  - Total de páginas
  - Has next/prev

**Recursos:**

- "Cursor pagination"
- "Advanced filtering Prisma"

---

### 🔹 FASE 4: Casos de Negocio Reales (2-3 semanas)

#### Semana 11: Descuentos y Promociones

**Objetivo:** Sistema de descuentos

- [ ] **Descuentos por producto**
  - Campo discount en Product
  - Cálculo de precio con descuento

- [ ] **Cupones**
  - Validación de cupones
  - Aplicación a orden

- [ ] **Descuentos por volumen**
  - Buy X get Y
  - Porcentaje por cantidad

**Recursos:**

- "Discount system design"
- "Promotion patterns"

---

#### Semana 12: Impuestos

**Objetivo:** Sistema de impuestos

- [ ] **Impuestos por región**
  - Configuración de tasas
  - Cálculo por ubicación

- [ ] **Impuestos por producto**
  - Productos exentos
  - Tasas diferenciadas

- [ ] **Facturación**
  - Generación de factura
  - Cálculo de totales con impuestos

**Recursos:**

- "Tax calculation system"
- "Invoice generation"

---

#### Semana 13: Historial de Cambios

**Objetivo:** Audit trail de cambios

- [ ] **Tabla de auditoría**
  - Model en Prisma
  - Trigger automático

- [ ] **Tracking de cambios**
  - Quién modificó
  - Cuándo modificó
  - Qué modificó

- [ ] **Endpoint de historial**
  - Ver cambios de una orden
  - Revertir cambios

**Recursos:**

- "Audit trail design"
- "Prisma triggers"

---

### 🔹 FASE 5: Seguridad (1-2 semanas)

#### Semana 14: Validación y Sanitización

**Objetivo:** Seguridad en inputs

- [ ] **Sanitización de inputs**
  - Usar `class-sanitizer`
  - Prevenir XSS

- [ ] **Rate limiting**
  - Limitar requests por IP
  - Proteger endpoints críticos

- [ ] **Validación de IDs**
  - Validar UUIDs
  - Prevenir ID spoofing

**Recursos:**

- "NestJS security best practices"
- "Input sanitization"

---

#### Semana 15: Autenticación y Autorización

**Objetivo:** Sistema de auth básico

- [ ] **JWT setup**
  - Configurar JWT en NestJS
  - Guards de autenticación

- [ ] **Roles y permisos**
  - RBAC básico
  - Guards por rol

- [ ] **Proteger endpoints**
  - Solo admins pueden eliminar
  - Solo usuarios propios pueden ver

**Recursos:**

- "NestJS JWT authentication"
- "Role based access control"

---

## 📈 Métricas de Progreso

### Checklist por Fase

- [ ] Fase 1: Fundamentos Sólidos (0/3 semanas)
- [ ] Fase 2: Arquitectura Limpia (0/4 semanas)
- [ ] Fase 3: Performance y Escalabilidad (0/3 semanas)
- [ ] Fase 4: Casos de Negocio Reales (0/3 semanas)
- [ ] Fase 5: Seguridad (0/2 semanas)

### Habilidades a Desarrollar

- [ ] Testing (0%)
- [ ] Arquitectura limpia (0%)
- [ ] Performance optimization (0%)
- [ ] Seguridad (0%)
- [ ] Logging profesional (0%)

---

## 🎯 Próximos Pasos Inmediatos

1. **Esta semana:** Empezar con class-validator en DTOs
2. **Semana siguiente:** Testing de OrdersService
3. **Luego:** ExceptionFilter global

---

## 📚 Recursos Generales

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 📝 Notas

- Cada semana puede ajustarse según dificultad
- Es mejor dominar un tema que cubrir varios superficialmente
- Usar el proyecto actual como base de experimentación
- Commitear después de cada milestone
