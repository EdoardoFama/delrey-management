-- V12: Adicionar a Moto Suzuki V-Strom 650xt para o perfil delrey
INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes, usuario)
SELECT 'Moto Suzuki V-Strom 650xt', 2024, '650cc', 'XT', 0, 'Minha moto nova', 'delrey'
WHERE NOT EXISTS (SELECT 1 FROM carro WHERE usuario = 'delrey' AND modelo = 'Moto Suzuki V-Strom 650xt');
