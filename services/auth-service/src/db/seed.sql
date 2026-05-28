SET client_encoding = 'UTF8';

-- ============================================================
-- HIRAOKA SERVICES — Datos de prueba (seed)
-- HSPP-35 | Sprint 3
-- 3 clientes · 5 productos · 8 tickets en distintos estados
-- ============================================================

-- ============================================================
-- CLIENTES (3)
-- ============================================================
INSERT INTO clientes (id_cliente, nombre, dni, telefono, email)
VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Ana Torres Ríos',       '74521836', '987654321', 'ana.torres@gmail.com'),

  ('a1000000-0000-0000-0000-000000000002',
   'Carlos Méndez Salas',   '63412987', '976543210', 'carlos.mendez@outlook.com'),

  ('a1000000-0000-0000-0000-000000000003',
   'Elena Ríos Castillo',   '52309741', '965432109', 'elena.rios@hotmail.com')
ON CONFLICT (dni) DO NOTHING;


-- ============================================================
-- TÉCNICO DE PRUEBA (para asignar a tickets)
-- Contraseña: Test1234! (bcrypt cost 12, generado offline)
-- ============================================================
INSERT INTO usuarios (id_usuario, nombre_completo, username, password_hash, id_rol)
VALUES (
  'b0000000-0000-0000-0000-000000000099',
  'Jander Huamaní López',
  'jhuamani',
  '$2b$12$eB6wPhbN48aqwg80ntpA7.PfErQ8ju3i42p/ZHlxypkGtQ1AlE3wa',
  (SELECT id_rol FROM roles WHERE nombre = 'Tecnico' LIMIT 1)
)
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- PRODUCTOS (5)
-- ============================================================
INSERT INTO productos (id_producto, nombre, marca, modelo, numero_serie)
VALUES
  ('c1000000-0000-0000-0000-000000000001',
   'Laptop',         'Dell',    'Inspiron 15 3511',  'DL-INS15-SN00123'),

  ('c1000000-0000-0000-0000-000000000002',
   'Smartphone',     'Samsung', 'Galaxy S24 Ultra',  'SM-S928B-SN00456'),

  ('c1000000-0000-0000-0000-000000000003',
   'Tablet',         'Apple',   'iPad Pro 12.9" M2', 'DMPXR2-SN00789'),

  ('c1000000-0000-0000-0000-000000000004',
   'Lavadora',       'LG',      'WM3600HWA',         'LG-WM3600-SN01011'),

  ('c1000000-0000-0000-0000-000000000005',
   'Televisor',      'Sony',    'Bravia XR-55A80L',  'SN-XR55A80-SN01213')
ON CONFLICT (numero_serie) DO NOTHING;


-- ============================================================
-- TICKETS (8) — todos los estados representados
-- ============================================================
INSERT INTO tickets (
  id_ticket, id_cliente, id_producto, id_tecnico,
  estado, descripcion_problema,
  fecha_ingreso, fecha_estimada_entrega
)
VALUES

  -- 1. Recibido — laptop de Ana
  ('d1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   NULL,
   'Recibido',
   'La laptop no enciende al presionar el botón de encendido. Cargador funciona correctamente.',
   NOW() - INTERVAL '1 day',
   NOW() + INTERVAL '5 days'),

  -- 2. Diagnosticando — smartphone de Carlos
  ('d1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000099',
   'Diagnosticando',
   'Pantalla presenta líneas verticales después de una caída. Táctil sigue funcionando.',
   NOW() - INTERVAL '3 days',
   NOW() + INTERVAL '4 days'),

  -- 3. En reparación — tablet de Elena
  ('d1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000099',
   'Reparando',
   'El iPad no carga. Puerto Lightning con suciedad y posible daño interno.',
   NOW() - INTERVAL '5 days',
   NOW() + INTERVAL '2 days'),

  -- 4. Listo — lavadora de Ana
  ('d1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000099',
   'Listo',
   'La lavadora emitía ruido excesivo durante el centrifugado. Se reemplazó el rodamiento.',
   NOW() - INTERVAL '8 days',
   NOW() - INTERVAL '1 day'),

  -- 5. Entregado — televisor de Carlos
  ('d1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000099',
   'Entregado',
   'El televisor no encendía. Fuente de poder defectuosa, se reemplazó.',
   NOW() - INTERVAL '15 days',
   NOW() - INTERVAL '8 days'),

  -- 6. Diagnosticando — laptop de Elena
  ('d1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000099',
   'Diagnosticando',
   'Teclado no responde en algunas teclas. Se sospecha de daño por líquido.',
   NOW() - INTERVAL '2 days',
   NOW() + INTERVAL '6 days'),

  -- 7. Recibido — smartphone de Elena
  ('d1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000002',
   NULL,
   'Recibido',
   'Batería se descarga en menos de 2 horas. El equipo tiene 2 años de uso.',
   NOW() - INTERVAL '12 hours',
   NOW() + INTERVAL '7 days'),

  -- 8. En reparación — televisor de Ana
  ('d1000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000099',
   'Reparando',
   'Imagen con franjas horizontales y parpadeo constante. Panel OLED con daño parcial.',
   NOW() - INTERVAL '6 days',
   NOW() + INTERVAL '3 days')

ON CONFLICT (id_ticket) DO NOTHING;

-- ============================================================
-- CORRECCION IDEMPOTENTE DE TEXTO UTF-8
-- Permite reparar volumenes locales inicializados con seeds antiguos.
-- ============================================================
UPDATE clientes
SET nombre = CASE id_cliente
  WHEN 'a1000000-0000-0000-0000-000000000001' THEN 'Ana Torres Ríos'
  WHEN 'a1000000-0000-0000-0000-000000000002' THEN 'Carlos Méndez Salas'
  WHEN 'a1000000-0000-0000-0000-000000000003' THEN 'Elena Ríos Castillo'
  ELSE nombre
END
WHERE id_cliente IN (
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000003'
);

UPDATE usuarios
SET nombre_completo = 'Jander Huamaní López'
WHERE id_usuario = 'b0000000-0000-0000-0000-000000000099';

UPDATE tickets
SET descripcion_problema = CASE id_ticket
  WHEN 'd1000000-0000-0000-0000-000000000001' THEN 'La laptop no enciende al presionar el botón de encendido. Cargador funciona correctamente.'
  WHEN 'd1000000-0000-0000-0000-000000000002' THEN 'Pantalla presenta líneas verticales después de una caída. Táctil sigue funcionando.'
  WHEN 'd1000000-0000-0000-0000-000000000003' THEN 'El iPad no carga. Puerto Lightning con suciedad y posible daño interno.'
  WHEN 'd1000000-0000-0000-0000-000000000004' THEN 'La lavadora emitía ruido excesivo durante el centrifugado. Se reemplazó el rodamiento.'
  WHEN 'd1000000-0000-0000-0000-000000000005' THEN 'El televisor no encendía. Fuente de poder defectuosa, se reemplazó.'
  WHEN 'd1000000-0000-0000-0000-000000000006' THEN 'Teclado no responde en algunas teclas. Se sospecha de daño por líquido.'
  WHEN 'd1000000-0000-0000-0000-000000000007' THEN 'Batería se descarga en menos de 2 horas. El equipo tiene 2 años de uso.'
  WHEN 'd1000000-0000-0000-0000-000000000008' THEN 'Imagen con franjas horizontales y parpadeo constante. Panel OLED con daño parcial.'
  ELSE descripcion_problema
END
WHERE id_ticket IN (
  'd1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000002',
  'd1000000-0000-0000-0000-000000000003',
  'd1000000-0000-0000-0000-000000000004',
  'd1000000-0000-0000-0000-000000000005',
  'd1000000-0000-0000-0000-000000000006',
  'd1000000-0000-0000-0000-000000000007',
  'd1000000-0000-0000-0000-000000000008'
);
