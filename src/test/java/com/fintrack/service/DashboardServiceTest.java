package com.fintrack.service;

import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.dto.DashboardCategoryBreakdownResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.AfterEach;

import java.util.List;
import java.math.BigDecimal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.fintrack.repository.projection.CategoryExpenseSummary;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;


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

        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);

        assertEquals(10, response.getMonth());
        assertEquals(2026, response.getYear());

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

        SecurityContextHolder.clearContext();
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

        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);

        assertEquals(1, response.getCategoryBreakdown().size());

        DashboardCategoryBreakdownResponse food =
                response.getCategoryBreakdown().get(0);

        assertEquals(1L, food.getCategoryId());

        assertEquals(
                "Food",
                food.getCategoryName()
        );

        assertEquals(
                new BigDecimal("3570.00"),
                food.getAmount()
        );
        }



        @AfterEach
        void clearSecurityContext() {
        SecurityContextHolder.clearContext();
        }
}