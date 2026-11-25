package com.fintrack.repository;

import com.fintrack.entity.Budget;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    @EntityGraph(attributePaths = {"category"})
    List<Budget> findByUserIdAndIsDeletedFalse(
            Long userId
    );

    @EntityGraph(attributePaths = {"category"})
    List<Budget> findByUserIdAndMonthAndYearAndIsDeletedFalse(
        Long userId,
        int month,
        int year
     );

     @EntityGraph(attributePaths = {"category"})
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