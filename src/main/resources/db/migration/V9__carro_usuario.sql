-- V9: Adicionar campo usuario na tabela carro para isolamento de dados por usuário
ALTER TABLE carro ADD COLUMN IF NOT EXISTS usuario VARCHAR(50);

-- Associar o Ford Del Rey Ghia existente ao usuário delrey
UPDATE carro SET usuario = 'delrey' WHERE id = 1 OR usuario IS NULL;

-- Criar carros para os outros usuários se não existirem
INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes, usuario)
SELECT 'Meu Carro', 2026, '', '', 0, 'Carro de kaiolucas', 'kaiolucas'
WHERE NOT EXISTS (SELECT 1 FROM carro WHERE usuario = 'kaiolucas');

INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes, usuario)
SELECT 'Tigo 5X', 2026, '', '', 0, 'Carro de tigo5x', 'tigo5x'
WHERE NOT EXISTS (SELECT 1 FROM carro WHERE usuario = 'tigo5x');
