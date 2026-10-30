package com.fintrack.service;

import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.AfterEach;

import java.math.BigDecimal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

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
        )).thenReturn(new BigDecimal("2870.00"));

        DashboardSummaryResponse response =
                dashboardService.getMonthlySummary(10, 2026);

        assertEquals(10, response.getMonth());
        assertEquals(2026, response.getYear());

        assertEquals(
                new BigDecimal("65000.00"),
                response.getTotalIncome()
        );

        assertEquals(
                new BigDecimal("2870.00"),
                response.getTotalExpenses()
        );

        assertEquals(
                new BigDecimal("62130.00"),
                response.getBalance()
        );

        SecurityContextHolder.clearContext();
        }

        @AfterEach
        void clearSecurityContext() {
        SecurityContextHolder.clearContext();
        }
}