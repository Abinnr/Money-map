
package com.fintrack.service;

import com.fintrack.entity.Budget;
import com.fintrack.entity.Category;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.CategoryExpenseSummary;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportsAdditionalServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    private ReportsService reportsService;

    @BeforeEach
    void setUp() {

        reportsService = new ReportsService(
                transactionRepository,
                budgetRepository
        );

        Authentication authentication = mock(Authentication.class);

        lenient().when(authentication.getPrincipal()).thenReturn(1L);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCalculateCategorySpendingPercentages() {

        CategoryExpenseSummary food =
                mock(CategoryExpenseSummary.class);

        when(food.getCategoryId()).thenReturn(1L);
        when(food.getCategoryName()).thenReturn("Food");
        when(food.getAmount()).thenReturn(new BigDecimal("2500.00"));

        CategoryExpenseSummary transport =
                mock(CategoryExpenseSummary.class);

        when(transport.getCategoryId()).thenReturn(2L);
        when(transport.getCategoryName()).thenReturn("Transport");
        when(transport.getAmount()).thenReturn(new BigDecimal("500.00"));

        when(transactionRepository.findExpenseSummaryByCategory(
                eq(1L),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of(food, transport));

        var result = reportsService.getCategoryReport(10, 2026);

        assertEquals(2, result.size());

        assertEquals("Food", result.get(0).getCategoryName());

        assertEquals(
                new BigDecimal("2500.00"),
                result.get(0).getAmount()
        );

        assertEquals(
                new BigDecimal("83.33"),
                result.get(0).getPercentage()
        );

        assertEquals(
                new BigDecimal("16.67"),
                result.get(1).getPercentage()
        );
    }

    @Test
    void shouldReturnEmptyCategoryReportWhenNoExpensesExist() {

        when(transactionRepository.findExpenseSummaryByCategory(
                eq(1L),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of());

        var result = reportsService.getCategoryReport(10, 2026);

        assertTrue(result.isEmpty());
    }

    @Test
    void shouldCalculateBudgetPerformance() {

        Budget budget = mock(Budget.class);
        Category category = mock(Category.class);

        when(budget.getId()).thenReturn(10L);
        when(budget.getAmount()).thenReturn(new BigDecimal("3000.00"));
        when(budget.getCategory()).thenReturn(category);

        when(category.getId()).thenReturn(1L);
        when(category.getName()).thenReturn("Food");

        when(budgetRepository
                .findByUserIdAndMonthAndYearAndIsDeletedFalse(
                        1L, 10, 2026
                )).thenReturn(List.of(budget));

        // Create projection mock with only the fields
        // required by the budget calculation.
        CategoryExpenseSummary food =
                mock(CategoryExpenseSummary.class);

        when(food.getCategoryId()).thenReturn(1L);
        when(food.getAmount()).thenReturn(new BigDecimal("3600.00"));

        when(transactionRepository.findExpenseSummaryByCategory(
                eq(1L),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of(food));

        var result = reportsService.getBudgetReport(10, 2026);

        assertEquals(1, result.size());

        assertEquals(
                new BigDecimal("3000.00"),
                result.get(0).getBudgetAmount()
        );

        assertEquals(
                new BigDecimal("3600.00"),
                result.get(0).getActualAmount()
        );

        assertEquals(
                new BigDecimal("-600.00"),
                result.get(0).getRemainingAmount()
        );

        assertEquals(
                new BigDecimal("120.00"),
                result.get(0).getUtilizationPercentage()
        );
    }

    @Test
    void shouldReturnZeroSpendingForBudgetWithoutTransactions() {

        Budget budget = mock(Budget.class);
        Category category = mock(Category.class);

        when(budget.getId()).thenReturn(10L);
        when(budget.getAmount()).thenReturn(new BigDecimal("3000.00"));
        when(budget.getCategory()).thenReturn(category);

        when(category.getId()).thenReturn(1L);
        when(category.getName()).thenReturn("Food");

        when(budgetRepository
                .findByUserIdAndMonthAndYearAndIsDeletedFalse(
                        1L, 10, 2026
                )).thenReturn(List.of(budget));

        when(transactionRepository.findExpenseSummaryByCategory(
                eq(1L),
                eq(TransactionType.EXPENSE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of());

        var result = reportsService.getBudgetReport(10, 2026);

        assertEquals(1, result.size());

        // Compare numerical values without depending on BigDecimal scale.
        assertEquals(
                0,
                result.get(0).getActualAmount().compareTo(BigDecimal.ZERO)
        );

        assertEquals(
                new BigDecimal("3000.00"),
                result.get(0).getRemainingAmount()
        );

        assertEquals(
                0,
                result.get(0).getUtilizationPercentage().compareTo(BigDecimal.ZERO)
        );
    }

    @Test
    void shouldReturnEmptyBudgetReportWhenNoBudgetsExist() {

        when(budgetRepository
                .findByUserIdAndMonthAndYearAndIsDeletedFalse(
                        1L, 10, 2026
                )).thenReturn(List.of());

        var result = reportsService.getBudgetReport(10, 2026);

        assertTrue(result.isEmpty());

        verify(transactionRepository, never())
                .findExpenseSummaryByCategory(
                        anyLong(),
                        any(TransactionType.class),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class)
                );
    }

    @Test
    void shouldRejectInvalidMonth() {

        assertThrows(
                ResponseStatusException.class,
                () -> reportsService.getCategoryReport(13, 2026)
        );

        assertThrows(
                ResponseStatusException.class,
                () -> reportsService.getBudgetReport(0, 2026)
        );
    }
}
 