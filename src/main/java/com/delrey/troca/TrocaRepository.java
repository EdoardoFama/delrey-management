package com.delrey.troca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TrocaRepository extends JpaRepository<Troca, Long> {

    List<Troca> findAllByOrderByDataTrocaDesc();

    List<Troca> findTop5ByOrderByDataTrocaDesc();

    @Query("select coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) from Troca t where t.dataTroca between :inicio and :fim")
    BigDecimal totalGastoNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
        select t from Troca t
        where t.peca.id = :pecaId
        order by t.dataTroca desc
    """)
    List<Troca> historicoPorPeca(Long pecaId);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where year(t.dataTroca) = :ano
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoAno(int ano);
}
