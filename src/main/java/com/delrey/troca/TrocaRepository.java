package com.delrey.troca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TrocaRepository extends JpaRepository<Troca, Long> {

    List<Troca> findByCarroIdOrderByDataTrocaDesc(Long carroId);

    List<Troca> findByCarroIdAndTipoOrderByDataTrocaDesc(Long carroId, String tipo);

    List<Troca> findTop5ByCarroIdAndDataTrocaBetweenOrderByDataTrocaDesc(Long carroId, LocalDate inicio, LocalDate fim);

    @Query("select coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) from Troca t where t.carro.id = :carroId and t.dataTroca between :inicio and :fim")
    BigDecimal totalGastoNoPeriodo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("select coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) from Troca t where t.carro.id = :carroId and t.dataTroca between :inicio and :fim and t.tipo = :tipo")
    BigDecimal totalGastoNoPeriodoPorTipo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim, @Param("tipo") String tipo);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.carro.id = :carroId and year(t.dataTroca) = :ano and t.tipo = :tipo
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoAnoPorTipo(@Param("carroId") Long carroId, @Param("ano") int ano, @Param("tipo") String tipo);

    @Query("""
        select t from Troca t
        where t.carro.id = :carroId and t.peca.id = :pecaId
        order by t.dataTroca desc
    """)
    List<Troca> historicoPorPeca(@Param("carroId") Long carroId, @Param("pecaId") Long pecaId);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.carro.id = :carroId and year(t.dataTroca) = :ano
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoAno(@Param("carroId") Long carroId, @Param("ano") int ano);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.carro.id = :carroId and t.dataTroca between :inicio and :fim
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoPeriodo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        select t.peca.categoria.nome as categoria, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total
        from Troca t
        where t.carro.id = :carroId and t.dataTroca between :inicio and :fim and t.tipo = :tipo
        group by t.peca.categoria.nome
        order by total desc
    """)
    List<Object[]> totalPorCategoriaNoPeriodoPorTipo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim, @Param("tipo") String tipo);

    @Query("select distinct year(t.dataTroca) from Troca t where t.carro.id = :carroId order by year(t.dataTroca) desc")
    List<Integer> anosComRegistros(@Param("carroId") Long carroId);

    @Query("""
        select t.fornecedor as fornecedor, coalesce(sum(t.valor),0) + coalesce(sum(t.maoDeObra),0) as total, count(t) as qtd
        from Troca t
        where t.carro.id = :carroId and t.fornecedor is not null and t.fornecedor <> ''
              and t.dataTroca between :inicio and :fim
        group by t.fornecedor
        order by total desc
    """)
    List<Object[]> rankingFornecedoresNoPeriodo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("select min(t.km) from Troca t where t.carro.id = :carroId and t.dataTroca between :inicio and :fim and t.km is not null")
    Integer kmMinNoPeriodo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("select max(t.km) from Troca t where t.carro.id = :carroId and t.dataTroca between :inicio and :fim and t.km is not null")
    Integer kmMaxNoPeriodo(@Param("carroId") Long carroId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        select t from Troca t
        where t.carro.id = :carroId and t.tipo = 'SERVICO' and t.garantiaMeses is not null and t.garantiaMeses > 0
        order by t.dataTroca desc
    """)
    List<Troca> servicosComGarantiaConfigurada(@Param("carroId") Long carroId);

    @Query(value = """
        select t.* from troca t
        where t.carro_id = :carroId and t.id in (
            select max(t2.id) from troca t2
            where t2.carro_id = :carroId
            group by t2.peca_id
        )
    """, nativeQuery = true)
    List<Troca> ultimaTrocaDeCadaPeca(@Param("carroId") Long carroId);
}
