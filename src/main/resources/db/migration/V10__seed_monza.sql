-- V10: Criar carro inicial para o usuário monza para isolamento de dados
INSERT INTO carro (modelo, ano, motor, versao, km_atual, observacoes, usuario)
SELECT 'Monza', 2026, '', '', 0, 'Carro de monza', 'monza'
WHERE NOT EXISTS (SELECT 1 FROM carro WHERE usuario = 'monza');
