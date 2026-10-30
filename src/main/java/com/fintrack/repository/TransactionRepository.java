package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;

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
}