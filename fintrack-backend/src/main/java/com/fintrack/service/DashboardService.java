package com.fintrack.service;

import com.fintrack.dto.DashboardBudgetResponse;
import com.fintrack.dto.DashboardCategoryBreakdownResponse;
import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.CategoryExpenseSummary;
import com.fintrack.security.SecurityUtil;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fintrack.dto.DashboardCategoryBreakdownResponse;
import com.fintrack.repository.projection.CategoryExpenseSummary;

import java.util.HashMap;
import java.util.List;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
private final BudgetRepository budgetRepository;

    public DashboardService(TransactionRepository transactionRepository,BudgetRepository budgetRepository) {
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    public DashboardSummaryResponse getMonthlySummary(
            int month,
            int year) {

        Long userId = SecurityUtil.getCurrentUserId();

        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate firstDayOfNextMonth = firstDay.plusMonths(1);

        LocalDateTime from = firstDay.atStartOfDay();
        LocalDateTime to = firstDayOfNextMonth.atStartOfDay();

        BigDecimal totalIncome =
                transactionRepository.sumAmountByUserAndTypeAndDateRange(
                                userId,
                                TransactionType.INCOME,
                                from,
                                to
                        );

        BigDecimal totalExpenses =
                transactionRepository.sumAmountByUserAndTypeAndDateRange(
                                userId,
                                TransactionType.EXPENSE,
                                from,
                                to
                        );

        BigDecimal balance =totalIncome.subtract(totalExpenses);



        // ---------------------------------------------------------
        // Expense breakdown
        // ---------------------------------------------------------

        List<CategoryExpenseSummary> categorySummaries =
        transactionRepository.findExpenseSummaryByCategory(
                userId,
                TransactionType.EXPENSE,
                from,
                to
        );

        List<DashboardCategoryBreakdownResponse> categoryBreakdown =
        categorySummaries.stream()
                .map(summary ->
                        new DashboardCategoryBreakdownResponse(
                                summary.getCategoryId(),
                                summary.getCategoryName(),
                                summary.getAmount()
                        )
                )
                .toList();

        // ---------------------------------------------------------
        // Budget vs Actual
        // ---------------------------------------------------------

        List<com.fintrack.entity.Budget> budgets =
                budgetRepository
                        .findByUserIdAndMonthAndYearAndIsDeletedFalse(
                                userId,
                                month,
                                year
                        );

        Map<Long, CategoryExpenseSummary> actualByCategory =
                new HashMap<>();

        for (CategoryExpenseSummary summary : categorySummaries) {
            actualByCategory.put(
                    summary.getCategoryId(),
                    summary
            );
        }

        List<DashboardBudgetResponse> budgetVsActual =
                budgets.stream()
                        .map(budget -> {

                            CategoryExpenseSummary actual =
                                    actualByCategory.get(
                                            budget.getCategory().getId()
                                    );

                            BigDecimal actualAmount =
                                    actual != null
                                            ? actual.getAmount()
                                            : BigDecimal.ZERO;

                            BigDecimal budgetAmount =
                                    budget.getAmount();

                            BigDecimal remainingAmount =
                                    budgetAmount.subtract(actualAmount);

                            BigDecimal percentageUsed =
                                    actualAmount
                                            .multiply(BigDecimal.valueOf(100))
                                            .divide(
                                                    budgetAmount,
                                                    2,
                                                    RoundingMode.HALF_UP
                                            );

                        return new DashboardBudgetResponse(
                                    budget.getCategory().getId(),
                                    budget.getCategory().getName(),
                                    budgetAmount,
                                    actualAmount,
                                    remainingAmount,
                                    percentageUsed
                            );
                        })
                        .toList();



                long transactionCount= transactionRepository.countByUserAndDateRange(
                                userId,
                                from,
                                to
                                );

         return new DashboardSummaryResponse(
                        month,
                        year,
                        totalIncome,
                        totalExpenses,
                        balance,
                        categoryBreakdown,
                        budgetVsActual,
                        transactionCount
                );

    }
}