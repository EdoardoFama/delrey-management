-- V16: Cadastrar a compra de óleo e filtro para a Moto Suzuki
INSERT INTO troca (carro_id, peca_id, tipo, data_troca, km, valor, mao_de_obra, fornecedor, garantia_meses, observacoes) VALUES
  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome LIKE 'Óleo do motor 10W-40%' AND tipo_veiculo='MOTO' LIMIT 1),
   'COMPRA', '2026-10-15', 18000, 180.00, 0.00, 'Oficina Especializada Suzuki', 6, 'Compra de óleo Motul 5100 10W40 4T JASO MA2'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de óleo do motor' AND tipo_veiculo='MOTO' LIMIT 1),
   'COMPRA', '2026-10-15', 18000, 65.00, 0.00, 'Oficina Especializada Suzuki', 6, 'Compra de filtro de óleo Hiflofiltro HF138');

UPDATE carro 
SET km_atual = 18500 
WHERE usuario = 'delrey' AND (tipo_veiculo = 'MOTO' OR modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%');
