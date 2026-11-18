package com.fintrack.service;

import com.fintrack.dto.MonthlyReportResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.MonthlyTransactionSummary;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ReportsService reportsService;

    private void setAuthenticatedUser() {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal()).thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    private MonthlyTransactionSummary createSummary(
            int year,
            int month,
            String income,
            String expenses
    ) {

        MonthlyTransactionSummary summary =
                mock(MonthlyTransactionSummary.class);

        when(summary.getYear()).thenReturn(year);
        when(summary.getMonth()).thenReturn(month);
        when(summary.getIncome()).thenReturn(new BigDecimal(income));
        when(summary.getExpenses()).thenReturn(new BigDecimal(expenses));

        return summary;
    }

    @Test
    void shouldCalculateMonthlyFinancialReport() {

        setAuthenticatedUser();

        MonthlyTransactionSummary january =
                createSummary(2026, 1, "60000.00", "28000.00");

        MonthlyTransactionSummary february =
                createSummary(2026, 2, "62000.00", "31000.00");

        when(transactionRepository.findMonthlySummaryByUserAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of(january, february));

        List<MonthlyReportResponse> reports =
                reportsService.getMonthlyReport("2026-01", "2026-02");

        assertEquals(2, reports.size());

        assertEquals(1, reports.get(0).getMonth());
        assertEquals(2026, reports.get(0).getYear());

        assertEquals(
                new BigDecimal("60000.00"),
                reports.get(0).getIncome()
        );

        assertEquals(
                new BigDecimal("28000.00"),
                reports.get(0).getExpenses()
        );

        assertEquals(
                new BigDecimal("32000.00"),
                reports.get(0).getBalance()
        );

        assertEquals(
                new BigDecimal("31000.00"),
                reports.get(1).getBalance()
        );

        verify(transactionRepository)
                .findMonthlySummaryByUserAndDateRange(
                        eq(1L),
                        eq(TransactionType.INCOME),
                        eq(TransactionType.EXPENSE),
                        eq(LocalDateTime.of(2026, 1, 1, 0, 0)),
                        eq(LocalDateTime.of(2026, 3, 1, 0, 0))
                );
    }

    @Test
    void shouldFillMonthsWithoutTransactionsWithZeroValues() {

        setAuthenticatedUser();

        MonthlyTransactionSummary january =
                createSummary(2026, 1, "50000.00", "20000.00");

        MonthlyTransactionSummary march =
                createSummary(2026, 3, "40000.00", "15000.00");

        when(transactionRepository.findMonthlySummaryByUserAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of(january, march));

        List<MonthlyReportResponse> reports =
                reportsService.getMonthlyReport("2026-01", "2026-03");

        assertEquals(3, reports.size());

        MonthlyReportResponse february = reports.get(1);

        assertEquals(2, february.getMonth());

        assertEquals(
                new BigDecimal("0.00"),
                february.getIncome()
        );

        assertEquals(
                new BigDecimal("0.00"),
                february.getExpenses()
        );

        assertEquals(
                new BigDecimal("0.00"),
                february.getBalance()
        );
    }

    @Test
    void shouldReturnZeroValuesWhenNoTransactionsExist() {

        setAuthenticatedUser();

        when(transactionRepository.findMonthlySummaryByUserAndDateRange(
                anyLong(),
                eq(TransactionType.INCOME),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of());

        List<MonthlyReportResponse> reports =
                reportsService.getMonthlyReport("2026-01", "2026-02");

        assertEquals(2, reports.size());

        for (MonthlyReportResponse report : reports) {
            assertEquals(BigDecimal.ZERO.setScale(2), report.getIncome());
            assertEquals(BigDecimal.ZERO.setScale(2), report.getExpenses());
            assertEquals(BigDecimal.ZERO.setScale(2), report.getBalance());
        }
    }

    @Test
    void shouldRejectFromMonthAfterToMonth() {

        assertThrows(
                ResponseStatusException.class,
                () -> reportsService.getMonthlyReport(
                        "2026-05",
                        "2026-01"
                )
        );
    }

    @Test
    void shouldRejectInvalidMonthFormat() {

        assertThrows(
                ResponseStatusException.class,
                () -> reportsService.getMonthlyReport(
                        "2026-13",
                        "2026-12"
                )
        );
    }

    @Test
    void shouldRejectReportRangeExceeding24Months() {

        assertThrows(
                ResponseStatusException.class,
                () -> reportsService.getMonthlyReport(
                        "2024-01",
                        "2026-01"
                )
        );
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }
}