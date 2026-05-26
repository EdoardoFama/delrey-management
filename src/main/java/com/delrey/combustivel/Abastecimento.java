package com.delrey.combustivel;

import com.delrey.carro.Carro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "abastecimento")
@Getter
@Setter
public class Abastecimento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carro_id")
    private Carro carro;

    @Column(nullable = false)
    private LocalDate data;

    private Integer km;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal litros;

    @Column(name = "valor_litro", nullable = false, precision = 10, scale = 3)
    private BigDecimal valorLitro;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "tipo_combustivel", length = 20)
    private String tipoCombustivel;

    private String posto;

    @Column(name = "tanque_cheio", nullable = false)
    private Boolean tanqueCheio = true;

    private String observacoes;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
