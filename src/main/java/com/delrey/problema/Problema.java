package com.delrey.problema;

import com.delrey.carro.Carro;
import com.delrey.peca.Peca;
import com.delrey.troca.Troca;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problema")
@Getter
@Setter
public class Problema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "carro_id")
    private Carro carro;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sintoma;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_resolucao")
    private LocalDate dataResolucao;

    @ManyToOne
    @JoinColumn(name = "troca_id_resolveu")
    private Troca trocaResolveu;

    private String observacoes;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "problema_peca_suspeita",
        joinColumns = @JoinColumn(name = "problema_id"),
        inverseJoinColumns = @JoinColumn(name = "peca_id")
    )
    private List<Peca> pecasSuspeitas = new ArrayList<>();
}
