-- V13: Atualização de manutenções realizadas para deixar alertas em dia
-- 1. Garantir que o km do Del Rey esteja em 158.100 km
UPDATE carro 
SET km_atual = 158100 
WHERE (id = 1 OR usuario = 'delrey') AND (km_atual IS NULL OR km_atual < 158100);

-- 2. Inserir manutenções realizadas
INSERT INTO troca (carro_id, peca_id, tipo, data_troca, km, valor, mao_de_obra, fornecedor, observacoes) VALUES
  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Bomba dágua' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Cabo de vela' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Correia dentada' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de combustível' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de ar' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Fluido de freio DOT4' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca do fluido de freio DOT4 aos 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Tensor da correia dentada' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Vela de ignição' LIMIT 1),
   'SERVICO', '2026-06-11', 156000, 0.00, 0.00, 'Mecânica Especializada', 'Troca realizada na revisão de 156.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de óleo' LIMIT 1),
   'SERVICO', '2026-11-06', 158100, 0.00, 0.00, 'Mecânica Especializada', 'Troca do filtro de óleo realizada aos 158.100 km junto com óleo do motor'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' OR id = 1 ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Bateria' LIMIT 1),
   'SERVICO', '2026-01-01', 150000, 0.00, 0.00, 'Auto Elétrica', 'Troca de bateria realizada em 01/01/2026');
