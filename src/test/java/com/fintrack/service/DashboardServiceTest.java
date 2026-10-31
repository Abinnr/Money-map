package com.fintrack.service;

import com.fintrack.dto.DashboardBudgetResponse;
import com.fintrack.dto.DashboardCategoryBreakdownResponse;
import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.Category;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.CategoryExpenseSummary;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private DashboardService dashboardService;


    @Test
    void shouldCalculateMonthlyFinancialSummary() {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal())
                .thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                any(),
                any()
        )).thenReturn(new BigDecimal("65000.00"));


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(new BigDecimal("3570.00"));


        when(transactionRepository.findExpenseSummaryByCategory(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(List.of());


        when(budgetRepository.findByUserIdAndMonthAndYearAndIsDeletedFalse(
                anyLong(),
                eq(10),
                eq(2026)
        )).thenReturn(List.of());

        when(transactionRepository.countByUserAndDateRange(
                anyLong(),
                any(),
                any()
        )).thenReturn(10L);


        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);


        assertEquals(10, response.getMonth());

        assertEquals(
                2026,
                response.getYear()
        );

        assertEquals(
                new BigDecimal("65000.00"),
                response.getTotalIncome()
        );

        assertEquals(
                new BigDecimal("3570.00"),
                response.getTotalExpenses()
        );

        assertEquals(
                new BigDecimal("61430.00"),
                response.getBalance()
        );

        assertEquals(10, response.getTransactionCount());
    }


    @Test
    void shouldCalculateExpenseBreakdownByCategory() {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal())
                .thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                any(),
                any()
        )).thenReturn(new BigDecimal("65000.00"));


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(new BigDecimal("3570.00"));


        CategoryExpenseSummary foodSummary =
                mock(CategoryExpenseSummary.class);

        when(foodSummary.getCategoryId())
                .thenReturn(1L);

        when(foodSummary.getCategoryName())
                .thenReturn("Food");

        when(foodSummary.getAmount())
                .thenReturn(new BigDecimal("3570.00"));


        when(transactionRepository.findExpenseSummaryByCategory(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(List.of(foodSummary));


        when(budgetRepository.findByUserIdAndMonthAndYearAndIsDeletedFalse(
                anyLong(),
                eq(10),
                eq(2026)
        )).thenReturn(List.of());


        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);


        assertEquals(
                1,
                response.getCategoryBreakdown().size()
        );


        DashboardCategoryBreakdownResponse food =
                response.getCategoryBreakdown().get(0);


        assertEquals(
                1L,
                food.getCategoryId()
        );

        assertEquals(
                "Food",
                food.getCategoryName()
        );

        assertEquals(
                new BigDecimal("3570.00"),
                food.getAmount()
        );
    }


    @Test
    void shouldCalculateBudgetVsActual() {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal())
                .thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                any(),
                any()
        )).thenReturn(new BigDecimal("65000.00"));


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(new BigDecimal("3570.00"));


        CategoryExpenseSummary foodSummary =
                mock(CategoryExpenseSummary.class);

        when(foodSummary.getCategoryId())
                .thenReturn(1L);

        when(foodSummary.getCategoryName())
                .thenReturn("Food");

        when(foodSummary.getAmount())
                .thenReturn(new BigDecimal("3570.00"));


        when(transactionRepository.findExpenseSummaryByCategory(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(List.of(foodSummary));


        Category foodCategory =
                mock(Category.class);

        when(foodCategory.getId())
                .thenReturn(1L);

        when(foodCategory.getName())
                .thenReturn("Food");


        Budget foodBudget =
                mock(Budget.class);

        when(foodBudget.getAmount())
                .thenReturn(new BigDecimal("5000.00"));

        when(foodBudget.getCategory())
                .thenReturn(foodCategory);


        when(budgetRepository.findByUserIdAndMonthAndYearAndIsDeletedFalse(
                anyLong(),
                eq(10),
                eq(2026)
        )).thenReturn(List.of(foodBudget));


        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);


        assertEquals(
                1,
                response.getBudgetVsActual().size()
        );


        DashboardBudgetResponse food =
                response.getBudgetVsActual().get(0);


        assertEquals(
                1L,
                food.getCategoryId()
        );

        assertEquals(
                "Food",
                food.getCategoryName()
        );

        assertEquals(
                new BigDecimal("5000.00"),
                food.getBudgetAmount()
        );

        assertEquals(
                new BigDecimal("3570.00"),
                food.getActualAmount()
        );

        assertEquals(
                new BigDecimal("1430.00"),
                food.getRemainingAmount()
        );

        assertEquals(
                new BigDecimal("71.40"),
                food.getPercentageUsed()
        );
    }


    @Test
    void shouldReturnZeroActualWhenBudgetCategoryHasNoSpending() {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal())
                .thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                any(),
                any()
        )).thenReturn(new BigDecimal("65000.00"));


        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(new BigDecimal("3570.00"));


        when(transactionRepository.findExpenseSummaryByCategory(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(),
                any()
        )).thenReturn(List.of());


        Category transportCategory =
                mock(Category.class);

        when(transportCategory.getId())
                .thenReturn(2L);

        when(transportCategory.getName())
                .thenReturn("Transport");


        Budget transportBudget =
                mock(Budget.class);

        when(transportBudget.getAmount())
                .thenReturn(new BigDecimal("3000.00"));

        when(transportBudget.getCategory())
                .thenReturn(transportCategory);


        when(budgetRepository.findByUserIdAndMonthAndYearAndIsDeletedFalse(
                anyLong(),
                eq(10),
                eq(2026)
        )).thenReturn(List.of(transportBudget));


        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);


        assertEquals(
                1,
                response.getBudgetVsActual().size()
        );


        DashboardBudgetResponse transport =
                response.getBudgetVsActual().get(0);


        assertEquals(
                2L,
                transport.getCategoryId()
        );

        assertEquals(
                "Transport",
                transport.getCategoryName()
        );

        assertEquals(
                new BigDecimal("3000.00"),
                transport.getBudgetAmount()
        );

        assertEquals(
                BigDecimal.ZERO,
                transport.getActualAmount()
        );

        assertEquals(
                new BigDecimal("3000.00"),
                transport.getRemainingAmount()
        );

        assertEquals(
                new BigDecimal("0.00"),
                transport.getPercentageUsed()
        );
    }


    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }
}