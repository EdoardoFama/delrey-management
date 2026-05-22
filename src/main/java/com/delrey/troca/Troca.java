package com.delrey.troca;

import com.delrey.carro.Carro;
import com.delrey.peca.Peca;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "troca")
@Getter
@Setter
public class Troca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "carro_id")
    private Carro carro;

    @ManyToOne(optional = false)
    @JoinColumn(name = "peca_id")
    private Peca peca;

    @Column(name = "data_troca", nullable = false)
    private LocalDate dataTroca;

    @Column(nullable = false)
    private Integer km;

    @Column(nullable = false)
    private BigDecimal valor;

    private String fornecedor;

    @Column(name = "garantia_meses")
    private Integer garantiaMeses;

    @Column(name = "mao_de_obra")
    private BigDecimal maoDeObra;

    private String observacoes;
}
