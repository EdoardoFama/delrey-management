-- V11: tornar litros e valor_litro nullable, adicionar km_andados
ALTER TABLE abastecimento
    ALTER COLUMN litros DROP NOT NULL;

ALTER TABLE abastecimento
    ALTER COLUMN valor_litro DROP NOT NULL;

ALTER TABLE abastecimento
    ADD COLUMN IF NOT EXISTS km_andados INTEGER;
