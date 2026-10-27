package com.fintrack.repository;

import com.fintrack.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndIsDeletedFalse(
            Long userId
    );

    Optional<Budget> findByIdAndUserIdAndIsDeletedFalse(
            Long budgetId,
            Long userId
    );

    boolean existsByUserIdAndCategoryIdAndMonthAndYearAndIsDeletedFalse(
            Long userId,
            Long categoryId,
            int month,
            int year
    );
}