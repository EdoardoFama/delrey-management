-- V5: Compras realizadas em fev/abr/maio 2026 (Mercado Livre)
-- Valores zerados — preencher pela interface

-- Novas peças que não existiam no catálogo
INSERT INTO peca (nome, categoria_id, codigo_oem) VALUES
  ('Flexível de freio dianteiro',         (SELECT id FROM categoria_peca WHERE nome='Freios'),                NULL),
  ('Flexível de freio traseiro',          (SELECT id FROM categoria_peca WHERE nome='Freios'),                NULL),
  ('Retentor traseiro do virabrequim',    (SELECT id FROM categoria_peca WHERE nome='Motor'),                 NULL),
  ('Mangueira bomba d''água ao cabeçote', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'),         '0261210531'),
  ('Mangueira do reservatório d''água',   (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'),         '0261210564'),
  ('Mangueira bomba d''água ao tubo',     (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'),         '0261210631'),
  ('Mangueira do reservatório (retorno)', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'),         NULL),
  ('Mangueira do filtro de combustível',  (SELECT id FROM categoria_peca WHERE nome='Alimentação'),           '84AU9A289A'),
  ('Depósito de água do radiador',        (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'),         NULL),
  ('Correia do alternador',               (SELECT id FROM categoria_peca WHERE nome='Motor'),                 '10A0765C'),
  ('Válvula de retenção anti-retorno',    (SELECT id FROM categoria_peca WHERE nome='Alimentação'),           NULL),
  ('Lanterna traseira',                   (SELECT id FROM categoria_peca WHERE nome='Carroceria/Acabamento'), NULL);

-- Compras (km=0 e valor=0.00 como placeholder)
INSERT INTO troca (carro_id, peca_id, tipo, data_troca, km, valor, fornecedor, observacoes) VALUES

  -- Freios
  (1, (SELECT id FROM peca WHERE nome='Cilindro mestre'),
      'COMPRA', '2026-04-22', 0, 0.00, 'CARPARTS.INDAIATUBA',   'Cilindro Mestre Original TRW'),

  (1, (SELECT id FROM peca WHERE nome='Flexível de freio traseiro'),
      'COMPRA', '2026-04-25', 0, 0.00, 'KARHUB AUTOPARTS',       'Par Flexível Do Freio Para Ford Del Rey Belina Pampa'),

  (1, (SELECT id FROM peca WHERE nome='Flexível de freio dianteiro'),
      'COMPRA', '2026-04-23', 0, 0.00, 'AUTOPEÇASFAMA',          '2 Flexível Freio Dianteiro Corcel Belina Del Rey Pampa'),

  (1, (SELECT id FROM peca WHERE nome='Pastilha de freio dianteira'),
      'COMPRA', '2026-04-24', 0, 0.00, 'ELUAUTOPEÇAS',           'Jogo Pastilha SYL1091 — Del Rey 84/91'),

  (1, (SELECT id FROM peca WHERE nome='Disco de freio dianteiro'),
      'COMPRA', '2026-04-22', 0, 0.00, 'FEMATHAUTOPECASSP',      'Par Disco Ventilado — Ford Del Rey 1.8 1989/1990/1991'),

  -- Transmissão
  (1, (SELECT id FROM peca WHERE nome='Kit embreagem (disco, platô, rolamento)'),
      'COMPRA', '2026-04-16', 0, 0.00, 'AUTOPEASLUDIOABCLTDAAUTO', 'Kit Embreagem AP 1.8/2.0'),

  -- Motor
  (1, (SELECT id FROM peca WHERE nome='Retentor traseiro do virabrequim'),
      'COMPRA', '2026-05-01', 0, 0.00, 'GTSDISTRIBUIDORADEAUTOPECAS', 'Retentor Volante Sabo — Motor AP'),

  (1, (SELECT id FROM peca WHERE nome='Correia do alternador'),
      'COMPRA', '2026-04-22', 0, 0.00, NULL,                     '10A0765C — Ford Del Rey 1.8 8v 1989/1991'),

  -- Arrefecimento
  (1, (SELECT id FROM peca WHERE nome='Bomba dágua'),
      'COMPRA', '2026-04-20', 0, 0.00, NULL,                     'Belina Del Rey 1.8 1989/1990/1991'),

  (1, (SELECT id FROM peca WHERE nome='Válvula termostática'),
      'COMPRA', '2026-04-15', 0, 0.00, NULL,                     'Wahler — AP 1.6/1.8'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira superior do radiador'),
      'COMPRA', '2026-04-29', 0, 0.00, 'SÃO PAULO AUTO PEÇAS',  NULL),

  (1, (SELECT id FROM peca WHERE nome='Mangueira inferior do radiador'),
      'COMPRA', '2026-05-01', 0, 0.00, NULL,                     'Del-Rey 1.8 Ano 1990'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira bomba d''água ao cabeçote'),
      'COMPRA', '2026-04-23', 0, 0.00, 'ARREFECE ABC',           '0261210531'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira do reservatório d''água'),
      'COMPRA', '2026-04-20', 0, 0.00, 'RLMPECAS',               '0261210564'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira bomba d''água ao tubo'),
      'COMPRA', '2026-04-20', 0, 0.00, 'BETTIAUTOPEÇAS',         '0261210631'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira do reservatório (retorno)'),
      'COMPRA', '2026-04-19', 0, 0.00, 'SANTO ANTÔNIOAUTOPEÇAS', 'Motor 1.8 AP Sem Ar'),

  (1, (SELECT id FROM peca WHERE nome='Depósito de água do radiador'),
      'COMPRA', '2026-04-16', 0, 0.00, NULL,                     'Del Rey 1.8 8v 89/90/91'),

  -- Alimentação
  (1, (SELECT id FROM peca WHERE nome='Mangueira do filtro de combustível'),
      'COMPRA', '2026-04-20', 0, 0.00, NULL,                     '84AU9A289A — Del Rey 1.6 1988/1992'),

  (1, (SELECT id FROM peca WHERE nome='Filtro de combustível'),
      'COMPRA', '2026-04-20', 0, 0.00, NULL,                     'Bosch GB0018'),

  (1, (SELECT id FROM peca WHERE nome='Válvula de retenção anti-retorno'),
      'COMPRA', '2026-04-17', 0, 0.00, NULL,                     NULL),

  -- Ignição
  (1, (SELECT id FROM peca WHERE nome='Correia dentada'),
      'COMPRA', '2026-04-14', 0, 0.00, NULL,                     'Kit Correia Dentada completo — AP 1.6/1.8/2.0'),

  (1, (SELECT id FROM peca WHERE nome='Cabo de vela'),
      'COMPRA', '2026-04-15', 0, 0.00, NULL,                     'Kit: Cabos + Tampa do distribuidor + Rotor — AP 1.6/1.8 1987/1994'),

  -- Carroceria
  (1, (SELECT id FROM peca WHERE nome='Lanterna traseira'),
      'COMPRA', '2026-02-26', 0, 0.00, NULL,                     'Par Lanterna Traseira Tricolor — Del Rey 85/92');
