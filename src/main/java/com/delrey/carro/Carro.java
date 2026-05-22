package com.delrey.carro;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "carro")
@Getter
@Setter
public class Carro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelo;
    private Integer ano;
    private String motor;
    private String versao;
    private String placa;

    @Column(name = "km_atual")
    private Integer kmAtual;

    private String cor;

    @Column(name = "foto_path")
    private String fotoPath;

    private String observacoes;
}
