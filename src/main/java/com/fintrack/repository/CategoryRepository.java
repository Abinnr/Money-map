package com.fintrack.repository;

import com.fintrack.entity.Category;
import com.fintrack.entity.CategoryType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    // List<Category> findByIsActiveTrueAndUserIdIsNullOrIsActiveTrueAndUserId(
    //         Long userId
    // );
    @Query("""
            SELECT c
            FROM Category c
            WHERE c.isActive = true
            AND (c.user IS NULL OR c.user.id = :userId)
            """)
    List<Category> findAvailableCategories(Long userId);
    

    Optional<Category> findByIdAndUserId(
            Long categoryId,
            Long userId
    );

    boolean existsByNameIgnoreCaseAndTypeAndUserIdAndIsActiveTrue(
        String name,
        CategoryType type,
        Long userId
        );
}