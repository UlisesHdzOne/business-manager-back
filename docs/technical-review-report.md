# 🔴 Problemas

### 1. AuthorResponseDto hereda clase incorrecta
- **Archivo:** `src/authors/dto/author-response.dto.ts`
- **Ubicación:** Línea 1
- **Problema:** Extiende `BaseUserResponseDto` en lugar de una clase base apropiada para autores
- **Por qué es un problema:** Author no es un User, es una entidad diferente. Esto crea confusión semántica y puede causar problemas si BaseUserResponseDto tiene campos específicos de usuarios.
- **Prioridad:** Alta

### 2. UsersService.findOne manejo manual de error
- **Archivo:** `src/users/users.service.ts`
- **Ubicación:** Líneas 82-93
- **Problema:** Usa `findUnique` y maneja `null` manualmente con `NotFoundException`
- **Por qué es un problema:** Inconsistente con el resto del código. Prisma puede manejar esto automáticamente con `findUniqueOrThrow` y el PrismaFilter.
- **Prioridad:** Media

### 3. AuthorsService.update lógica redundante
- **Archivo:** `src/authors/authors.service.ts`
- **Ubicación:** Líneas 145-161
- **Problema:** Compara cada campo con el valor actual antes de actualizar
- **Por qué es un problema:** Lógica innecesaria. Prisma ya no actualiza si el valor es el mismo. El código es más complejo sin beneficio.
- **Prioridad:** Baja

### 4. BooksService.create no usa select
- **Archivo:** `src/books/books.service.ts`
- **Ubicación:** Líneas 125-128
- **Problema:** `create` no usa `bookSelect`, solo `update` y `findOne` lo usan
- **Por qué es un problema:** Inconsistencia. Puede devolver campos no deseados como `createdAt`, `updatedAt`, `description`.
- **Prioridad:** Media

### 5. LoansService.create no verifica préstamo duplicado
- **Archivo:** `src/loans/loans.service.ts`
- **Ubicación:** Líneas 64-117
- **Problema:** No verifica si el libro ya está prestado al mismo usuario
- **Por qué es un problema:** Un usuario podría tener múltiples préstamos del mismo libro simultáneamente si la lógica de concurrencia falla. No hay constraint en Prisma para prevenir esto.
- **Prioridad:** Alta

### 6. UpdateLoanDto no se usa
- **Archivo:** `src/loans/dto/update-loan.dto.ts`
- **Ubicación:** Archivo completo
- **Problema:** El DTO existe pero no hay endpoint PATCH en LoansController
- **Por qué es un problema:** Código muerto. O se usa o se elimina.
- **Prioridad:** Baja

### 7. AuthorsService.restore consulta redundante
- **Archivo:** `src/authors/authors.service.ts`
- **Ubicación:** Líneas 244-249
- **Problema:** Después de la transacción, hace otro `findUnique` para devolver el autor
- **Por qué es un problema:** La transacción ya actualizó el autor, podría devolver el resultado directamente de la transacción.
- **Prioridad:** Baja

### 8. UsersService.update no valida cambios vacíos
- **Archivo:** `src/users/users.service.ts`
- **Ubicación:** Líneas 129-136
- **Problema:** No valida si se enviaron cambios antes de actualizar
- **Por qué es un problema:** Inconsistente con AuthorsService que sí valida. Permite actualizaciones vacías que consumen recursos.
- **Prioridad:** Media

### 9. BooksService.update no valida cambios vacíos
- **Archivo:** `src/books/books.service.ts`
- **Ubicación:** Líneas 144-167
- **Problema:** No valida si se enviaron cambios antes de actualizar
- **Por qué es un problema:** Inconsistente con AuthorsService que sí valida.
- **Prioridad:** Media

### 10. LoansService.returnLoan race condition
- **Archivo:** `src/loans/loans.service.ts`
- **Ubicación:** Líneas 119-155
- **Problema:** Verifica `loan.returnDate` fuera de la transacción
- **Por qué es un problema:** Entre la verificación y la transacción, otro proceso podría devolver el préstamo. La verificación debería estar dentro de la transacción.
- **Prioridad:** Alta

---

## 🟡 Inconsistencias

### 1. buildWhere default active
- **Archivos:** `src/users/users.service.ts` vs `src/authors/authors.service.ts`
- **Inconsistencia:** Users no tiene default para `active`, Authors usa `active ?? true`
- **Impacto:** Comportamiento diferente al filtrar. Users devuelve todos por defecto, Authors solo activos.

### 2. Validación de cambios vacíos
- **Archivos:** Todos los servicios
- **Inconsistencia:** Solo AuthorsService valida cambios vacíos. Users y Books no.
- **Impacto:** Comportamiento inconsistente entre módulos.

### 3. Métodos restore
- **Archivos:** Todos los servicios
- **Inconsistencia:** Authors y Books tienen `restore`, Users no tiene.
- **Impacto:** Inconsistencia en la API. Users no puede reactivarse.

### 4. AtLeastOne decorator
- **Archivos:** DTOs de update
- **Inconsistencia:** Solo UpdateAuthorDto usa `@AtLeastOne`. Users y Books no.
- **Impacto:** Diferente nivel de validación entre módulos.

### 5. findUnique vs findUniqueOrThrow
- **Archivos:** Todos los servicios
- **Inconsistencia:** Algunos usan `findUnique` + manejo manual, otros podrían usar `findUniqueOrThrow`.
- **Impacto:** Código inconsistente y más verboso de lo necesario.

### 6. Loans no tiene delete/restore
- **Archivos:** Todos los servicios
- **Inconsistencia:** Users, Authors, Books tienen delete/restore. Loans solo tiene create/return.
- **Impacto:** Loans no puede eliminarse ni restaurarse, solo devolverse.

### 7. Orden de rutas en controllers
- **Archivos:** Todos los controllers
- **Inconsistencia:** Users tiene GET :id antes de GET. Books tiene GET antes de GET :id.
- **Impacto:** NestJS evalúa rutas en orden, podría causar conflictos si no se cuida.

---

## 🟢 Correcto

### 1. Select reutilizables
- **Archivos:** Todos los servicios
- **Decisión:** Uso de `const userSelect`, `const authorSelect`, etc. con `satisfies Prisma.XSelect`
- **Por qué es correcto:** Type-safe, reutilizable, consistente, evita errores de tipado.

### 2. plainToInstance con excludeExtraneousValues
- **Archivos:** Todos los servicios
- **Decisión:** Uso consistente de `plainToInstance(ResponseDto, data, { excludeExtraneousValues: true })`
- **Por qué es correcto:** Garantiza que solo los campos decorados con `@Expose()` se devuelven. Seguridad de datos.

### 3. Paginación consistente
- **Archivos:** Todos los servicios
- **Decisión:** `Promise.all` con `findMany` y `count`, cálculo de `lastPage` con `Math.max(1, Math.ceil(total / limit))`
- **Por qué es correcto:** Eficiente (paralelo), maneja edge case de total=0, consistente entre módulos.

### 4. Transacciones en Loans
- **Archivos:** `src/loans/loans.service.ts`
- **Decisión:** Uso de `$transaction` en `create` y `returnLoan` para actualizar Book.available y Loan
- **Por qué es correcto:** Garantiza consistencia. Si falla una operación, se rollback todo.

### 5. Validación de active/inactive
- **Archivos:** Authors, Books
- **Decisión:** Validar que author/book esté activo antes de permitir operaciones
- **Decisión:** Al desactivar author, desactivar sus libros con `AUTHOR_INACTIVE`
- **Por qué es correcto:** Mantiene integridad de negocio. Un autor inactivo no debería tener libros activos.

### 6. Transformación de booleanos en Query DTOs
- **Archivos:** Todos los Query DTOs
- **Decisión:** Transform manual de 'true'/'false' a boolean en @Transform decorator
- **Por qué es correcto:** Maneja query params que siempre vienen como strings. Consistente.

### 7. PartialType para Update DTOs
- **Archivos:** Todos los Update DTOs
- **Decisión:** `UpdateXDto extends PartialType(CreateXDto)`
- **Por qué es correcto:** Patrón estándar de NestJS. Hace todos los campos opcionales para updates.

### 8. Soft delete en Authors/Books
- **Archivos:** Authors, Books
- **Decisión:** `delete` cambia `active` a `false` en lugar de eliminar el registro
- **Por qué es correcto:** Preserva historial, permite restauración, mejor para auditoría.

### 9. Enum para BookInactiveReason
- **Archivo:** `prisma/schema.prisma`
- **Decisión:** Uso de enum para `AUTHOR_INACTIVE` y `MANUAL`
- **Por qué es correcto:** Type-safe, documentado, previene valores inválidos.

### 10. Filtro active en Loans
- **Archivo:** `src/loans/loans.service.ts`
- **Decisión:** `active: true` → `returnDate: null`, `active: false` → `returnDate: { not: null }`
- **Por qué es correcto:** Abstracción elegante. El cliente no necesita conocer la implementación interna.

---

## 🔵 Antes de Auth

### 1. Corregir AuthorResponseDto
Cambiar `BaseUserResponseDto` por una clase base apropiada (crear `BasePersonResponseDto` o similar).

### 2. Agregar validación de cambios vacíos
Implementar en UsersService y BooksService la validación que tiene AuthorsService.

### 3. Unificar buildWhere default active
Decidir si todos los módulos deben tener default `active: true` o ninguno. Unificar comportamiento.

### 4. Corregir race condition en LoansService.returnLoan
Mover la verificación de `loan.returnDate` dentro de la transacción.

### 5. Verificar préstamo duplicado en LoansService.create
Agregar verificación para prestar que el usuario no tenga ya ese libro prestado.

### 6. Decidir sobre UpdateLoanDto
O agregar endpoint PATCH en LoansController, o eliminar el DTO si no se usará.

### 7. Agregar restore a Users (opcional)
Si se desea consistencia, agregar método restore a UsersService y UsersController.

### 8. Usar findUniqueOrThrow consistentemente
Reemplazar `findUnique` + manejo manual por `findUniqueOrThrow` donde sea apropiado.
