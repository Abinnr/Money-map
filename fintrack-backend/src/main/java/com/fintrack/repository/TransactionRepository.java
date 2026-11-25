package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.projection.CategoryExpenseSummary;
import com.fintrack.repository.projection.MonthlyTransactionSummary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
                JpaSpecificationExecutor<Transaction> {

    @Override
    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findAll(@Nullable Specification<Transaction> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Optional<Transaction> findByIdAndUserIdAndIsDeletedFalse(
            Long transactionId,
            Long userId
    );


    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
        AND t.type = :type
        AND t.transactionDate >= :from
        AND t.transactionDate < :to
        AND t.isDeleted = false
        """)
    BigDecimal sumAmountByUserAndTypeAndDateRange(
            Long userId,
            TransactionType type,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
        SELECT
            t.category.id AS categoryId,
            t.category.name AS categoryName,
            SUM(t.amount) AS amount
        FROM Transaction t
        WHERE t.user.id = :userId
        AND t.type = :type
        AND t.transactionDate >= :from
        AND t.transactionDate < :to
        AND t.isDeleted = false
        GROUP BY t.category.id, t.category.name
        ORDER BY SUM(t.amount) DESC
        """)
    List<CategoryExpenseSummary> findExpenseSummaryByCategory(
            Long userId,
            TransactionType type,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.user.id = :userId
        AND t.transactionDate >= :from
        AND t.transactionDate < :to
        AND t.isDeleted = false
        """)
    long countByUserAndDateRange(
            Long userId,
            LocalDateTime from,
            LocalDateTime to
    );

    // Reports: monthly income and expense aggregation

    @Query("""
        SELECT
            FUNCTION('YEAR', t.transactionDate) AS year,
            FUNCTION('MONTH', t.transactionDate) AS month,

            SUM(
                CASE
                    WHEN t.type = :incomeType THEN t.amount
                    ELSE t.amount * 0
                END
            ) AS income,

            SUM(
                CASE
                    WHEN t.type = :expenseType THEN t.amount
                    ELSE t.amount * 0
                END
            ) AS expenses

        FROM Transaction t

        WHERE t.user.id = :userId
        AND t.transactionDate >= :from
        AND t.transactionDate < :to
        AND t.isDeleted = false

        GROUP BY
            FUNCTION('YEAR', t.transactionDate),
            FUNCTION('MONTH', t.transactionDate)

        ORDER BY
            FUNCTION('YEAR', t.transactionDate),
            FUNCTION('MONTH', t.transactionDate)
        """)
    List<MonthlyTransactionSummary> findMonthlySummaryByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("incomeType") TransactionType incomeType,
            @Param("expenseType") TransactionType expenseType,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}