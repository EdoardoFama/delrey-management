package com.delrey.hodometro;

import com.delrey.carro.Carro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leitura_km")
@Getter
@Setter
public class LeituraKm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carro_id")
    private Carro carro;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private Integer km;

    private String observacoes;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
