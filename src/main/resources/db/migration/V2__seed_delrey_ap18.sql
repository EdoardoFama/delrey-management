-- Carro do usuário
INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes)
VALUES ('Ford Del Rey', 1990, 'AP 1.8', 'Ghia', 0, 'Carro do usuário');

-- Categorias
INSERT INTO categoria_peca (nome) VALUES ('Motor');
INSERT INTO categoria_peca (nome) VALUES ('Ignição');
INSERT INTO categoria_peca (nome) VALUES ('Alimentação');
INSERT INTO categoria_peca (nome) VALUES ('Arrefecimento');
INSERT INTO categoria_peca (nome) VALUES ('Transmissão');
INSERT INTO categoria_peca (nome) VALUES ('Suspensão');
INSERT INTO categoria_peca (nome) VALUES ('Direção');
INSERT INTO categoria_peca (nome) VALUES ('Freios');
INSERT INTO categoria_peca (nome) VALUES ('Elétrica');
INSERT INTO categoria_peca (nome) VALUES ('Escapamento');
INSERT INTO categoria_peca (nome) VALUES ('Carroceria/Acabamento');
INSERT INTO categoria_peca (nome) VALUES ('Filtros e Fluidos');

-- Catálogo típico Del Rey AP 1.8
-- Motor
INSERT INTO peca (nome, categoria_id, intervalo_km, observacoes) VALUES ('Correia dentada', (SELECT id FROM categoria_peca WHERE nome='Motor'), 60000, 'Trocar junto com tensor e bomba dágua');
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Tensor da correia dentada', (SELECT id FROM categoria_peca WHERE nome='Motor'), 60000);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Junta do cabeçote', (SELECT id FROM categoria_peca WHERE nome='Motor'), NULL);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Retentor do virabrequim', (SELECT id FROM categoria_peca WHERE nome='Motor'), NULL);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Coxim do motor', (SELECT id FROM categoria_peca WHERE nome='Motor'), NULL);
INSERT INTO peca (nome, categoria_id) VALUES ('Bronzina de biela', (SELECT id FROM categoria_peca WHERE nome='Motor'));

-- Ignição
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Vela de ignição', (SELECT id FROM categoria_peca WHERE nome='Ignição'), 20000);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Cabo de vela', (SELECT id FROM categoria_peca WHERE nome='Ignição'), 40000);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Bobina de ignição', (SELECT id FROM categoria_peca WHERE nome='Ignição'), NULL);
INSERT INTO peca (nome, categoria_id) VALUES ('Distribuidor', (SELECT id FROM categoria_peca WHERE nome='Ignição'));
INSERT INTO peca (nome, categoria_id) VALUES ('Rotor do distribuidor', (SELECT id FROM categoria_peca WHERE nome='Ignição'));
INSERT INTO peca (nome, categoria_id) VALUES ('Tampa do distribuidor', (SELECT id FROM categoria_peca WHERE nome='Ignição'));
INSERT INTO peca (nome, categoria_id) VALUES ('Módulo de ignição', (SELECT id FROM categoria_peca WHERE nome='Ignição'));

-- Alimentação (AP 1.8 carburado / injeção dependendo do ano)
INSERT INTO peca (nome, categoria_id, observacoes) VALUES ('Carburador (kit reparo)', (SELECT id FROM categoria_peca WHERE nome='Alimentação'), 'Solex/Brosol 2E ou similar');
INSERT INTO peca (nome, categoria_id) VALUES ('Bomba de combustível mecânica', (SELECT id FROM categoria_peca WHERE nome='Alimentação'));
INSERT INTO peca (nome, categoria_id) VALUES ('Bomba de combustível elétrica', (SELECT id FROM categoria_peca WHERE nome='Alimentação'));
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Filtro de combustível', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 20000);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Filtro de ar', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 15000);
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Filtro de óleo', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 5000);
INSERT INTO peca (nome, categoria_id, intervalo_km, observacoes) VALUES ('Óleo do motor', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 5000, '20W50 mineral recomendado para AP antigo');

-- Arrefecimento
INSERT INTO peca (nome, categoria_id, intervalo_km, observacoes) VALUES ('Bomba dágua', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'), 60000, 'Trocar junto com correia dentada');
INSERT INTO peca (nome, categoria_id) VALUES ('Radiador', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Mangueira superior do radiador', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Mangueira inferior do radiador', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Válvula termostática', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Eletroventilador', (SELECT id FROM categoria_peca WHERE nome='Arrefecimento'));

-- Transmissão
INSERT INTO peca (nome, categoria_id) VALUES ('Kit embreagem (disco, platô, rolamento)', (SELECT id FROM categoria_peca WHERE nome='Transmissão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Cabo de embreagem', (SELECT id FROM categoria_peca WHERE nome='Transmissão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Coxim do câmbio', (SELECT id FROM categoria_peca WHERE nome='Transmissão'));
INSERT INTO peca (nome, categoria_id, intervalo_km) VALUES ('Óleo do câmbio', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 50000);

-- Suspensão
INSERT INTO peca (nome, categoria_id) VALUES ('Amortecedor dianteiro', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Amortecedor traseiro', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Mola dianteira', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Mola traseira', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Batente do amortecedor', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Pivô de suspensão', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Bandeja dianteira', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));
INSERT INTO peca (nome, categoria_id) VALUES ('Bucha da bandeja', (SELECT id FROM categoria_peca WHERE nome='Suspensão'));

-- Direção
INSERT INTO peca (nome, categoria_id) VALUES ('Terminal de direção', (SELECT id FROM categoria_peca WHERE nome='Direção'));
INSERT INTO peca (nome, categoria_id) VALUES ('Barra de direção (axial)', (SELECT id FROM categoria_peca WHERE nome='Direção'));
INSERT INTO peca (nome, categoria_id) VALUES ('Caixa de direção', (SELECT id FROM categoria_peca WHERE nome='Direção'));
INSERT INTO peca (nome, categoria_id) VALUES ('Coifa da caixa de direção', (SELECT id FROM categoria_peca WHERE nome='Direção'));

-- Freios
INSERT INTO peca (nome, categoria_id) VALUES ('Pastilha de freio dianteira', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id) VALUES ('Disco de freio dianteiro', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id) VALUES ('Lona/Sapata traseira', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id) VALUES ('Tambor de freio traseiro', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id) VALUES ('Cilindro mestre', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id) VALUES ('Cilindro de roda traseiro', (SELECT id FROM categoria_peca WHERE nome='Freios'));
INSERT INTO peca (nome, categoria_id, intervalo_meses) VALUES ('Fluido de freio DOT4', (SELECT id FROM categoria_peca WHERE nome='Filtros e Fluidos'), 24);
INSERT INTO peca (nome, categoria_id) VALUES ('Servo freio (hidrovácuo)', (SELECT id FROM categoria_peca WHERE nome='Freios'));

-- Elétrica
INSERT INTO peca (nome, categoria_id, intervalo_meses) VALUES ('Bateria', (SELECT id FROM categoria_peca WHERE nome='Elétrica'), 24);
INSERT INTO peca (nome, categoria_id) VALUES ('Alternador', (SELECT id FROM categoria_peca WHERE nome='Elétrica'));
INSERT INTO peca (nome, categoria_id) VALUES ('Motor de partida', (SELECT id FROM categoria_peca WHERE nome='Elétrica'));
INSERT INTO peca (nome, categoria_id) VALUES ('Chave de ignição', (SELECT id FROM categoria_peca WHERE nome='Elétrica'));
INSERT INTO peca (nome, categoria_id) VALUES ('Relé', (SELECT id FROM categoria_peca WHERE nome='Elétrica'));

-- Escapamento
INSERT INTO peca (nome, categoria_id) VALUES ('Coletor de escape', (SELECT id FROM categoria_peca WHERE nome='Escapamento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Silencioso traseiro', (SELECT id FROM categoria_peca WHERE nome='Escapamento'));
INSERT INTO peca (nome, categoria_id) VALUES ('Silencioso intermediário', (SELECT id FROM categoria_peca WHERE nome='Escapamento'));
