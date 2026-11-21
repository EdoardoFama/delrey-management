-- V15: Remover compras e serviços gerados para a moto, mantendo apenas as peças no catálogo e alertas
DELETE FROM anexo WHERE troca_id IN (
    SELECT id FROM troca WHERE peca_id IN (SELECT id FROM peca WHERE tipo_veiculo = 'MOTO')
       OR carro_id IN (SELECT id FROM carro WHERE tipo_veiculo = 'MOTO' OR modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%' OR modelo LIKE '%Moto%')
);

DELETE FROM troca WHERE peca_id IN (SELECT id FROM peca WHERE tipo_veiculo = 'MOTO')
   OR carro_id IN (SELECT id FROM carro WHERE tipo_veiculo = 'MOTO' OR modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%' OR modelo LIKE '%Moto%');

UPDATE carro 
SET km_atual = 0 
WHERE usuario = 'delrey' AND (tipo_veiculo = 'MOTO' OR modelo LIKE '%Suzuki%' OR modelo LIKE '%V-Strom%' OR modelo LIKE '%Moto%');
