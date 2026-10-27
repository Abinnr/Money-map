package com.fintrack.service;

import com.fintrack.dto.BudgetResponse;
import com.fintrack.dto.CreateBudgetRequest;
import com.fintrack.dto.UpdateBudgetRequest;
import com.fintrack.entity.Category;
import com.fintrack.entity.CategoryType;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.exception.BudgetAlreadyExistsException;
import com.fintrack.exception.InvalidBudgetException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.SecurityUtil;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {

        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public BudgetResponse createBudget(
            CreateBudgetRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        validateDuplicateBudget(
                userId,
                request.getCategoryId(),
                request.getMonth(),
                request.getYear()
        );

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        Category category =
                categoryRepository.findById(
                        request.getCategoryId()
                )
                .orElseThrow(() ->
                        new InvalidBudgetException(
                                "Category not found"
                        )
                );

        validateCategory(category, userId);

        Budget budget = new Budget();

        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setUser(user);
        budget.setCategory(category);
        budget.setDeleted(false);

        LocalDateTime now = LocalDateTime.now();

        budget.setCreatedAt(now);
        budget.setUpdatedAt(now);

        Budget savedBudget =
                budgetRepository.save(budget);

        return toResponse(savedBudget);
    }

    public List<BudgetResponse> getMyBudgets() {

        Long userId = SecurityUtil.getCurrentUserId();

        return budgetRepository
                .findByUserIdAndIsDeletedFalse(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BudgetResponse getMyBudget(
            Long budgetId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Budget budget =
                budgetRepository
                        .findByIdAndUserIdAndIsDeletedFalse(
                                budgetId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found"
                                )
                        );

        return toResponse(budget);
    }

    public BudgetResponse updateBudget(
            Long budgetId,
            UpdateBudgetRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        Budget budget =
                budgetRepository
                        .findByIdAndUserIdAndIsDeletedFalse(
                                budgetId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found"
                                )
                        );

        boolean duplicate =
                budgetRepository
                        .existsByUserIdAndCategoryIdAndMonthAndYearAndIsDeletedFalse(
                                userId,
                                request.getCategoryId(),
                                request.getMonth(),
                                request.getYear()
                        );

        boolean sameBudget =
                budget.getCategory()
                        .getId()
                        .equals(request.getCategoryId())
                        && budget.getMonth()
                        == request.getMonth()
                        && budget.getYear()
                        == request.getYear();

        if (duplicate && !sameBudget) {

            throw new BudgetAlreadyExistsException(
                    "Budget already exists for this category and period"
            );
        }

        Category category =
                categoryRepository.findById(
                        request.getCategoryId()
                )
                .orElseThrow(() ->
                        new InvalidBudgetException(
                                "Category not found"
                        )
                );

        validateCategory(category, userId);

        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setCategory(category);
        budget.setUpdatedAt(LocalDateTime.now());

        Budget updatedBudget =
                budgetRepository.save(budget);

        return toResponse(updatedBudget);
    }

    public void deleteBudget(Long budgetId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Budget budget =
                budgetRepository
                        .findByIdAndUserIdAndIsDeletedFalse(
                                budgetId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Budget not found"
                                )
                        );

        budget.setDeleted(true);
        budget.setUpdatedAt(LocalDateTime.now());

        budgetRepository.save(budget);
    }

    private void validateDuplicateBudget(
            Long userId,
            Long categoryId,
            int month,
            int year) {

        boolean exists =
                budgetRepository
                        .existsByUserIdAndCategoryIdAndMonthAndYearAndIsDeletedFalse(
                                userId,
                                categoryId,
                                month,
                                year
                        );

        if (exists) {

            throw new BudgetAlreadyExistsException(
                    "Budget already exists for this category and period"
            );
        }
    }

    private void validateCategory(
            Category category,
            Long userId) {

        if (!category.isActive()) {

            throw new InvalidBudgetException(
                    "Category is inactive"
            );
        }

        if (category.getType() != CategoryType.EXPENSE) {

            throw new InvalidBudgetException(
                    "Budget category must be an expense category"
            );
        }

        boolean isSystemCategory =
                category.getUser() == null;

        boolean belongsToUser =
                category.getUser() != null
                        && category.getUser()
                        .getId()
                        .equals(userId);

        if (!isSystemCategory && !belongsToUser) {

            throw new InvalidBudgetException(
                    "Category is not available"
            );
        }
    }

    private BudgetResponse toResponse(
            Budget budget) {

        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                budget.getMonth(),
                budget.getYear(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}