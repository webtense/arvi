# Politica de firma digital para Partes de Seguro

## Niveles de firma

### 1) Firma interna (operativa)
- Firma manuscrita en pantalla.
- Guarda fecha, hora, parte, tecnico y PDF final.
- Valida para operativa diaria y control interno.

### 2) Firma avanzada (recomendada para litigio)
- Identificacion reforzada del firmante (OTP por email/SMS).
- Evidencias de integridad del documento (hash) y trazabilidad.
- Mayor fuerza probatoria ante conflicto.

### 3) Firma cualificada (maximo nivel)
- Prestador cualificado eIDAS.
- Equivalencia legal a firma manuscrita en UE.

## Decision para ARVI

Se implementa inicialmente nivel **firma interna** con trazabilidad y envio automatico de PDF a cliente y empresa.
La arquitectura queda preparada para evolucionar a firma avanzada en una segunda fase.

## Evidencias minimas guardadas

- ID de parte y numero de parte
- Imagen de firma del cliente
- Fecha y hora de firma
- Email de envio del parte
- PDF generado tras cierre

## Requisitos previos al cierre de parte

1. Confirmar trabajo realizado
2. Verificar email del cliente
3. Capturar firma del cliente
4. Generar y enviar PDF a cliente y ARVI
