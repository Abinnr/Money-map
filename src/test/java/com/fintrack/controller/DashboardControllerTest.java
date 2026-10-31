package com.fintrack.controller;

import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.service.DashboardService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardControllerTest {

    @Test
    void shouldReturnMonthlyDashboardSummary() {

        DashboardService dashboardService =
                mock(DashboardService.class);

        DashboardController dashboardController =
                new DashboardController(dashboardService);

        DashboardSummaryResponse response =
                new DashboardSummaryResponse(
        10,
        2026,
        new BigDecimal("65000.00"),
        new BigDecimal("3570.00"),
        new BigDecimal("61430.00"),
        List.of(),
        List.of()
);

        when(dashboardService.getMonthlySummary(10, 2026))
                .thenReturn(response);

        DashboardSummaryResponse result =
                dashboardController.getMonthlySummary(10, 2026);

        assertEquals(10, result.getMonth());
        assertEquals(2026, result.getYear());

        assertEquals(
                new BigDecimal("65000.00"),
                result.getTotalIncome()
        );

        assertEquals(
                new BigDecimal("3570.00"),
                result.getTotalExpenses()
        );

        assertEquals(
                new BigDecimal("61430.00"),
                result.getBalance()
        );
    }
}