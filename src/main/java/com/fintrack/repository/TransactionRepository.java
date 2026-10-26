package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}