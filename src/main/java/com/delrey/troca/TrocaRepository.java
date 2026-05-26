package com.delrey.troca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TrocaRepository extends JpaRepository<Troca, Long> {

    List<Troca> findAllByOrderByDataTrocaDesc();

    List<Troca> findByTipoOrderByDataTrocaDesc(String tipo);

    List<Troca> findTop5ByOrderByDataTrocaDesc();

    List<Troca> findTop5ByDataTrocaBetweenOrderByDataTrocaDesc(LocalDate inicio, LocalDate fim);

    @Query("select coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) from Troca t where t.dataTroca between :inicio and :fim")
    BigDecimal totalGastoNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("select coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) from Troca t where t.dataTroca between :inicio and :fim and t.tipo = :tipo")
    BigDecimal totalGastoNoPeriodoPorTipo(LocalDate inicio, LocalDate fim, String tipo);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where year(t.dataTroca) = :ano and t.tipo = :tipo
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoAnoPorTipo(int ano, String tipo);

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

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.dataTroca between :inicio and :fim
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.dataTroca between :inicio and :fim and t.tipo = :tipo
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoPeriodoPorTipo(LocalDate inicio, LocalDate fim, String tipo);

    @Query("select distinct year(t.dataTroca) from Troca t order by year(t.dataTroca) desc")
    List<Integer> anosComRegistros();

    @Query("""
        select t.fornecedor as fornecedor, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total, count(t) as qtd
        from Troca t
        where t.fornecedor is not null and t.fornecedor <> ''
              and t.dataTroca between :inicio and :fim
        group by t.fornecedor
        order by total desc
    """)
    List<Object[]> rankingFornecedoresNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("select min(t.km) from Troca t where t.dataTroca between :inicio and :fim and t.km is not null")
    Integer kmMinNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("select max(t.km) from Troca t where t.dataTroca between :inicio and :fim and t.km is not null")
    Integer kmMaxNoPeriodo(LocalDate inicio, LocalDate fim);

    @Query("""
        select t from Troca t
        where t.tipo = 'SERVICO' and t.garantiaMeses is not null and t.garantiaMeses > 0
        order by t.dataTroca desc
    """)
    List<Troca> servicosComGarantiaConfigurada();

    @Query(value = """
        select t.* from troca t
        where t.id in (
            select max(t2.id) from troca t2
            where t2.peca_id = t.peca_id
            group by t2.peca_id
        )
    """, nativeQuery = true)
    List<Troca> ultimaTrocaDeCadaPeca();
}
