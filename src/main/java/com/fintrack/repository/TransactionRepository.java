package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.projection.CategoryExpenseSummary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
                JpaSpecificationExecutor<Transaction> {

        // List<Transaction> findByUserIdAndIsDeletedFalse(
        //         Long userId
        // );

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
}