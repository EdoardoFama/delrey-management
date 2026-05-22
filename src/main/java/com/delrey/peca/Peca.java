package com.delrey.peca;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "peca")
@Getter
@Setter
public class Peca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "categoria_id")
    private CategoriaPeca categoria;

    @Column(name = "codigo_oem")
    private String codigoOem;

    private String fabricante;

    @Column(name = "intervalo_km")
    private Integer intervaloKm;

    @Column(name = "intervalo_meses")
    private Integer intervaloMeses;

    private String observacoes;
}
