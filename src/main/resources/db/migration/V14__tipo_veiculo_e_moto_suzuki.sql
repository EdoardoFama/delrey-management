-- V14: Adiciona tipo_veiculo em carro e peca, cadastra catalogo para Moto e injeta dados da Suzuki V-Strom 650xt

-- 1. Colunas tipo_veiculo
ALTER TABLE carro ADD COLUMN IF NOT EXISTS tipo_veiculo VARCHAR(20) DEFAULT 'CARRO';
ALTER TABLE peca ADD COLUMN IF NOT EXISTS tipo_veiculo VARCHAR(20) DEFAULT 'CARRO';

-- 2. Atualizar veículos existentes
UPDATE carro SET tipo_veiculo = 'CARRO' WHERE tipo_veiculo IS NULL;

-- Atualiza a moto de delrey se já foi criada no V12
UPDATE carro 
SET tipo_veiculo = 'MOTO', 
    ano = 2021, 
    modelo = 'Suzuki V-Strom 650 XT', 
    motor = '645cc V-Twin DOHC', 
    versao = 'XT ABS', 
    km_atual = 18500, 
    observacoes = 'Suzuki V-Strom 650 XT 2021 - Moto pessoal'
WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%' OR modelo LIKE '%Moto%');

-- Se ainda não existir a moto, insere
INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes, usuario, tipo_veiculo)
SELECT 'Suzuki V-Strom 650 XT', 2021, '645cc V-Twin DOHC', 'XT ABS', 18500, 'Suzuki V-Strom 650 XT 2021 - Moto pessoal', 'delrey', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%'));

-- 3. Atualizar todas as pecas já cadastradas para CARRO
UPDATE peca SET tipo_veiculo = 'CARRO' WHERE tipo_veiculo IS NULL;

-- 4. Garantir categorias necessárias
INSERT INTO categoria_peca (nome)
SELECT 'Pneus e Rodas' WHERE NOT EXISTS (SELECT 1 FROM categoria_peca WHERE nome = 'Pneus e Rodas');

-- 5. Inserir Peças de Catálogo exclusivas para MOTO (tipo_veiculo = 'MOTO')
INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Óleo do motor 10W-40 4T (Sintético / Semissintético JASO MA2)', 
       (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos' LIMIT 1), 
       '10W40-MA2', 'Motul', 6000, 12, 
       'Motul 5100 10W-40 ou Yamalube 4T JASO MA2 API SL+. Capacidade: 2.400 ml na troca com filtro.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Óleo do motor 10W-40 4T (Sintético / Semissintético JASO MA2)' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Filtro de óleo do motor', 
       (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos' LIMIT 1), 
       '16510-07J00 / HF138', 'Hiflofiltro', 6000, 12, 
       'Filtro de óleo blindado tipo rosca. Recomenda-se trocar a cada troca de óleo.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Filtro de óleo do motor' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Filtro de ar do motor', 
       (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos' LIMIT 1), 
       '13780-27G10 / HFA3611', 'Hiflofiltro', 12000, 24, 
       'Elemento filtrante de celulose. Inspeção e limpeza recomendada a cada 6.000 km.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Filtro de ar do motor' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Velas de ignição Laser Iridium (Jogo com 4 velas)', 
       (SELECT id FROM categoria_peca WHERE nome='Ignição' LIMIT 1), 
       'CR8EIA-9', 'NGK Iridium', 12000, 24, 
       'Motor Dual Spark com 2 velas de irídio por cilindro (total 4). Gap de eletrodo: 0,8 - 0,9 mm.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Velas de ignição Laser Iridium (Jogo com 4 velas)' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Kit relação / Transmissão secundária (Corrente 525 + Coroa 47D + Pinhão 15D)', 
       (SELECT id FROM categoria_peca WHERE nome='Transmissão' LIMIT 1), 
       '525VX3-118L', 'D.I.D', 25000, NULL, 
       'Corrente com retentor X-Ring (118 elos), coroa 47 dentes e pinhão 15 dentes. Limpeza e lubrificação a cada 500-1000 km.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Kit relação / Transmissão secundária (Corrente 525 + Coroa 47D + Pinhão 15D)' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Pastilhas de freio dianteiras (Duplo disco)', 
       (SELECT id FROM categoria_peca WHERE nome='Freios' LIMIT 1), 
       'FA229HH', 'EBC Brakes', 15000, NULL, 
       'Pastilhas sinterizadas Double-H para duplo disco flutuante Tokico 310mm dianteiro.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Pastilhas de freio dianteiras (Duplo disco)' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Pastilhas de freio traseiras', 
       (SELECT id FROM categoria_peca WHERE nome='Freios' LIMIT 1), 
       'FA174HH', 'EBC Brakes', 15000, NULL, 
       'Pastilhas sinterizadas Double-H para pinça traseira Nissin 260mm monopistão.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Pastilhas de freio traseiras' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Fluido de freio DOT 4', 
       (SELECT id FROM categoria_peca WHERE nome='Freios' LIMIT 1), 
       'DOT 4 Brake Fluid', 'Motul', 12000, 24, 
       'Substituição com sangria total dianteira e traseira (compatível com sistema ABS).', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Fluido de freio DOT 4' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Líquido de arrefecimento do radiador', 
       (SELECT id FROM categoria_peca WHERE nome='Arrefecimento' LIMIT 1), 
       'Motocool Expert', 'Motul', 24000, 24, 
       'Aditivo orgânico 50/50 pronto uso. Capacidade total do sistema: 1.950 ml.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Líquido de arrefecimento do radiador' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Fluido de suspensão dianteira / Óleo de bengala', 
       (SELECT id FROM categoria_peca WHERE nome='Suspensão' LIMIT 1), 
       'Fork Oil 10W', 'Motul', 24000, 24, 
       'Óleo das bengalas garfo telescópico 43mm. ~524 ml por cilindro dianteiro.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Fluido de suspensão dianteira / Óleo de bengala' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Pneu dianteiro 110/80 R19 59V Tubeless', 
       (SELECT id FROM categoria_peca WHERE nome='Pneus e Rodas' LIMIT 1), 
       'Tourance Next 2', 'Metzeler', 20000, NULL, 
       'Pneu dianteiro sem câmara para roda raiada tubeless aro 19 da versão XT. Pressão recomendada: 33 PSI.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Pneu dianteiro 110/80 R19 59V Tubeless' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Pneu traseiro 150/70 R17 69V Tubeless', 
       (SELECT id FROM categoria_peca WHERE nome='Pneus e Rodas' LIMIT 1), 
       'Tourance Next 2', 'Metzeler', 15000, NULL, 
       'Pneu traseiro sem câmara para roda raiada tubeless aro 17 da versão XT. Pressão: 36 PSI (solo) / 41 PSI (carga).', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Pneu traseiro 150/70 R17 69V Tubeless' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Bateria selada 12V 10Ah/12Ah (YTX12-BS)', 
       (SELECT id FROM categoria_peca WHERE nome='Elétrica' LIMIT 1), 
       'YTX12-BS / 33610-14F00', 'Yuasa', NULL, 36, 
       'Bateria selada AGM livre de manutenção com alto poder de arranque.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Bateria selada 12V 10Ah/12Ah (YTX12-BS)' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Inspeção e regulagem de folga de válvulas', 
       (SELECT id FROM categoria_peca WHERE nome='Motor' LIMIT 1), 
       'Pastilhas 9.48mm', 'Suzuki Service', 24000, NULL, 
       'Verificação e ajuste das folgas. Admissão: 0,10 - 0,20 mm; Escape: 0,20 - 0,30 mm.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Inspeção e regulagem de folga de válvulas' AND tipo_veiculo = 'MOTO');

INSERT INTO peca (nome, categoria_id, codigo_oem, fabricante, intervalo_km, intervalo_meses, observacoes, tipo_veiculo)
SELECT 'Filtro de combustível da bomba de injeção', 
       (SELECT id FROM categoria_peca WHERE nome='Alimentação' LIMIT 1), 
       '15410-24FB0', 'Suzuki OEM', 30000, NULL, 
       'Filtro de alta pressão interno no tanque acoplado à bomba.', 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM peca WHERE nome = 'Filtro de combustível da bomba de injeção' AND tipo_veiculo = 'MOTO');

-- 6. Inserir histórico de manutenções realizadas (troca) para a Moto Suzuki do usuário delrey
INSERT INTO troca (carro_id, peca_id, tipo, data_troca, km, valor, mao_de_obra, fornecedor, garantia_meses, observacoes) VALUES
  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Óleo do motor 10W-40 4T (Sintético / Semissintético JASO MA2)' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-10-15', 18000, 180.00, 50.00, 'Oficina Especializada Suzuki', 6, 'Troca de 2.4L de Motul 5100 10W40 na revisão de 18.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de óleo do motor' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-10-15', 18000, 65.00, 0.00, 'Oficina Especializada Suzuki', 6, 'Filtro Hiflo HF138 instalado junto com o óleo aos 18.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Kit relação / Transmissão secundária (Corrente 525 + Coroa 47D + Pinhão 15D)' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-10-15', 18000, 0.00, 40.00, 'Oficina Especializada Suzuki', 3, 'Limpeza profunda, desengraxe, ajuste de tensão e lubrificação técnica Motul Chain Lube'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Filtro de ar do motor' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-03-20', 12000, 190.00, 30.00, 'Motopeças Autorizada', 6, 'Substituição do elemento filtrante HFA3611 aos 12.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Velas de ignição Laser Iridium (Jogo com 4 velas)' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-03-20', 12000, 380.00, 80.00, 'Motopeças Autorizada', 6, 'Instalação das 4 velas NGK CR8EIA-9 Iridium Dual Spark na revisão de 12.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Fluido de freio DOT 4' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-03-20', 12000, 85.00, 70.00, 'Motopeças Autorizada', 12, 'Sangria e substituição completa dos circuitos dianteiro e traseiro com sangrador a vácuo'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Líquido de arrefecimento do radiador' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-03-20', 12000, 125.00, 60.00, 'Motopeças Autorizada', 12, 'Drenagem, flush com água desmineralizada e preenchimento com Motul Motocool 50/50'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Pastilhas de freio dianteiras (Duplo disco)' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-07-10', 15000, 320.00, 50.00, 'Freios & Cia Moto', 6, 'Pastilhas dianteiras sinterizadas EBC FA229HH instaladas aos 15.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Pastilhas de freio traseiras' AND tipo_veiculo='MOTO' LIMIT 1),
   'SERVICO', '2026-07-10', 15000, 185.00, 30.00, 'Freios & Cia Moto', 6, 'Pastilha traseira sinterizada EBC FA174HH instalada aos 15.000 km'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Pneu dianteiro 110/80 R19 59V Tubeless' AND tipo_veiculo='MOTO' LIMIT 1),
   'COMPRA', '2026-07-10', 15000, 760.00, 0.00, 'Centro de Pneus Moto Adventure', 12, 'Pneu Metzeler Tourance Next 2 aro 19 montado e balanceado'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Pneu traseiro 150/70 R17 69V Tubeless' AND tipo_veiculo='MOTO' LIMIT 1),
   'COMPRA', '2026-07-10', 15000, 990.00, 0.00, 'Centro de Pneus Moto Adventure', 12, 'Pneu Metzeler Tourance Next 2 aro 17 montado e balanceado'),

  ((SELECT id FROM carro WHERE usuario = 'delrey' AND (modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%') ORDER BY id LIMIT 1),
   (SELECT id FROM peca WHERE nome='Bateria selada 12V 10Ah/12Ah (YTX12-BS)' AND tipo_veiculo='MOTO' LIMIT 1),
   'COMPRA', '2026-01-10', 10000, 480.00, 0.00, 'Baterias Express', 18, 'Bateria Yuasa YTX12-BS original ativada e instalada');
