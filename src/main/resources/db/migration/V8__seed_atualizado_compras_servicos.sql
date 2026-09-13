-- V8: Seed atualizado de Compras e Serviços com valores e KM reais da planilha
-- 1. Garantir que as peças novas da planilha existam no catálogo
INSERT INTO peca (nome, categoria_id)
SELECT 'Bomba de Direção Hidráulica', id FROM categoria_peca WHERE nome='Direção'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome='Bomba de Direção Hidráulica');

INSERT INTO peca (nome, categoria_id)
SELECT 'Cabeçote', id FROM categoria_peca WHERE nome='Motor'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome='Cabeçote');

INSERT INTO peca (nome, categoria_id)
SELECT 'Tubo D''agua Motor', id FROM categoria_peca WHERE nome='Arrefecimento'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome='Tubo D''agua Motor');

-- 2. Limpar dados anteriores de trocas para reinserção limpa e sem duplicatas
DELETE FROM anexo WHERE troca_id IN (SELECT id FROM troca WHERE carro_id = 1);
UPDATE problema SET troca_id_resolveu = NULL WHERE troca_id_resolveu IN (SELECT id FROM troca WHERE carro_id = 1);
DELETE FROM troca WHERE carro_id = 1;

-- 3. Atualizar KM do carro para o KM mais recente (156.000 km)
UPDATE carro SET km_atual = 156000 WHERE id = 1;

-- 4. Inserir todas as 31 compras e serviços com valores, KM, mão de obra e detalhes completos da planilha
INSERT INTO troca (carro_id, peca_id, tipo, data_troca, km, valor, mao_de_obra, fornecedor, garantia_meses, observacoes) VALUES
  (1, (SELECT id FROM peca WHERE nome='Filtro de combustível' LIMIT 1),
      'COMPRA', '2026-06-16', 156000, 15.00, 0.00, 'BONANZA', NULL, 'Tecfil - AG68'),

  (1, (SELECT id FROM peca WHERE nome='Coxim do motor' LIMIT 1),
      'COMPRA', '2026-06-14', 156000, 44.00, 0.00, 'Ymax', NULL, 'Coxim pro Motor Direito'),

  (1, (SELECT id FROM peca WHERE nome='Bomba de Direção Hidráulica' LIMIT 1),
      'COMPRA', '2026-06-12', NULL, 470.00, 0.00, 'Indisa', NULL, 'Código Produto: DH454109 Números Referência: 3254221556 (VOLKSWAGEN) 7671955904 (ZF) 94109 (AMPRI)'),

  (1, (SELECT id FROM peca WHERE nome='Cabeçote' LIMIT 1),
      'COMPRA', '2026-06-03', 156000, 1400.00, 0.00, 'Retifica Soares', NULL, 'Cabeçote AP 1.8'),

  (1, (SELECT id FROM peca WHERE nome='Tubo D''agua Motor' LIMIT 1),
      'COMPRA', '2026-05-24', NULL, 34.00, 0.00, 'E-CarParts', NULL, 'Código: 15573 / Original: 0261210659'),

  (1, (SELECT id FROM peca WHERE nome='Relé' LIMIT 1),
      'SERVICO', '2026-05-14', 156000, 0.00, 150.00, 'Alex', NULL, 'Relé torou, provavelmente resecamento.'),

  (1, (SELECT id FROM peca WHERE nome='Retentor traseiro do virabrequim' LIMIT 1),
      'COMPRA', '2026-05-01', 0, 94.00, 0.00, 'GTSDISTRIBUIDORADEAUTOPECAS', NULL, 'Retentor Volante Sabo — Motor AP'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira inferior do radiador' LIMIT 1),
      'COMPRA', '2026-05-01', 0, 50.00, 0.00, NULL, NULL, 'Del-Rey 1.8 Ano 1990'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira superior do radiador' LIMIT 1),
      'COMPRA', '2026-04-29', 0, 46.00, 0.00, 'SÃO PAULO AUTO PEÇAS', NULL, NULL),

  (1, (SELECT id FROM peca WHERE nome='Flexível de freio traseiro' LIMIT 1),
      'COMPRA', '2026-04-25', 0, 74.00, 0.00, 'KARHUB AUTOPARTS', NULL, 'Par Flexível Do Freio Para Ford Del Rey Belina Pampa'),

  (1, (SELECT id FROM peca WHERE nome='Pastilha de freio dianteira' LIMIT 1),
      'COMPRA', '2026-04-24', 0, 36.00, 0.00, 'ELUAUTOPEÇAS', NULL, 'Jogo Pastilha SYL1091 — Del Rey 84/91'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira bomba d''água ao cabeçote' LIMIT 1),
      'COMPRA', '2026-04-23', 0, 65.00, 0.00, 'ARREFECE ABC', NULL, '261210531'),

  (1, (SELECT id FROM peca WHERE nome='Flexível de freio dianteiro' LIMIT 1),
      'COMPRA', '2026-04-23', 0, 71.00, 0.00, 'AUTOPEÇASFAMA', NULL, '2 Flexível Freio Dianteiro Corcel Belina Del Rey Pampa'),

  (1, (SELECT id FROM peca WHERE nome='Correia do alternador' LIMIT 1),
      'COMPRA', '2026-04-22', 0, 43.00, 0.00, NULL, NULL, '10A0765C — Ford Del Rey 1.8 8v 1989/1991'),

  (1, (SELECT id FROM peca WHERE nome='Disco de freio dianteiro' LIMIT 1),
      'COMPRA', '2026-04-22', 0, 179.00, 0.00, 'FEMATHAUTOPECASSP', NULL, 'Par Disco Ventilado — Ford Del Rey 1.8 1989/1990/1991'),

  (1, (SELECT id FROM peca WHERE nome='Cilindro mestre' LIMIT 1),
      'COMPRA', '2026-04-22', 0, 157.00, 0.00, 'CARPARTS.INDAIATUBA', NULL, 'Cilindro Mestre Original TRW'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira bomba d''água ao tubo' LIMIT 1),
      'COMPRA', '2026-04-20', 0, 69.00, 0.00, 'BETTIAUTOPEÇAS', NULL, '261210631'),

  (1, (SELECT id FROM peca WHERE nome='Filtro de combustível' LIMIT 1),
      'COMPRA', '2026-04-20', 0, 23.00, 0.00, NULL, NULL, 'Bosch GB0018'),

  (1, (SELECT id FROM peca WHERE nome='Bomba dágua' LIMIT 1),
      'COMPRA', '2026-04-20', 0, 115.00, 0.00, NULL, NULL, 'Belina Del Rey 1.8 1989/1990/1991'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira do reservatório d''água' LIMIT 1),
      'COMPRA', '2026-04-20', 0, 42.00, 0.00, 'RLMPECAS', NULL, '261210564'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira do filtro de combustível' LIMIT 1),
      'COMPRA', '2026-04-20', 0, 41.00, 0.00, NULL, NULL, '84AU9A289A — Del Rey 1.6 1988/1992'),

  (1, (SELECT id FROM peca WHERE nome='Mangueira do reservatório (retorno)' LIMIT 1),
      'COMPRA', '2026-04-19', 0, 43.00, 0.00, 'SANTO ANTÔNIOAUTOPEÇAS', NULL, 'Motor 1.8 AP Sem Ar'),

  (1, (SELECT id FROM peca WHERE nome='Servo freio (hidrovácuo)' LIMIT 1),
      'COMPRA', '2026-04-19', NULL, 37.00, 0.00, 'lemarketautopeças - shope', NULL, 'interna: 12m / Externa: 20mm / Comprimento: 1m - 4Rubber'),

  (1, (SELECT id FROM peca WHERE nome='Válvula de retenção anti-retorno' LIMIT 1),
      'COMPRA', '2026-04-17', 0, 38.00, 0.00, NULL, NULL, NULL),

  (1, (SELECT id FROM peca WHERE nome='Kit embreagem (disco, platô, rolamento)' LIMIT 1),
      'COMPRA', '2026-04-16', 0, 533.00, 0.00, 'AUTOPEASLUDIOABCLTDAAUTO', NULL, 'Kit Embreagem AP 1.8/2.0'),

  (1, (SELECT id FROM peca WHERE nome='Depósito de água do radiador' LIMIT 1),
      'COMPRA', '2026-04-16', 0, 50.00, 0.00, NULL, NULL, 'Del Rey 1.8 8v 89/90/91'),

  (1, (SELECT id FROM peca WHERE nome='Cabo de vela' LIMIT 1),
      'COMPRA', '2026-04-15', 0, 375.00, 0.00, NULL, NULL, 'Kit: Cabos + Tampa do distribuidor + Rotor — AP 1.6/1.8 1987/1994'),

  (1, (SELECT id FROM peca WHERE nome='Válvula termostática' LIMIT 1),
      'COMPRA', '2026-04-15', 0, 53.00, 0.00, NULL, NULL, 'Wahler — AP 1.6/1.8'),

  (1, (SELECT id FROM peca WHERE nome='Correia dentada' LIMIT 1),
      'COMPRA', '2026-04-14', 0, 70.00, 0.00, NULL, NULL, 'Kit Correia Dentada completo — AP 1.6/1.8/2.0'),

  (1, (SELECT id FROM peca WHERE nome='Óleo do motor' LIMIT 1),
      'SERVICO', '2026-03-02', 155000, 80.00, 70.00, 'Lubricenter - Supreme', 12, 'Feita a troca, porém está com vazamento de óleo desde esse dia. - 20w50'),

  (1, (SELECT id FROM peca WHERE nome='Lanterna traseira' LIMIT 1),
      'COMPRA', '2026-02-26', 0, 177.00, 0.00, 'MERCADODAZPEÇAS', NULL, 'Par Lanterna Traseira Tricolor — Del Rey 85/92');
