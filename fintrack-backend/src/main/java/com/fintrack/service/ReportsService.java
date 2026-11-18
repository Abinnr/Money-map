
package com.fintrack.service;

import com.fintrack.dto.BudgetReportResponse;
import com.fintrack.dto.CategoryReportResponse;
import com.fintrack.dto.MonthlyReportResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.MonthlyTransactionSummary;
import com.fintrack.repository.projection.CategoryExpenseSummary;
import com.fintrack.security.SecurityUtil;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportsService {

    private static final int MAX_REPORT_MONTHS = 24;

    private static final DateTimeFormatter MONTH_FORMATTER =
            DateTimeFormatter.ofPattern("uuuu-MM");

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public ReportsService(
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository) {

        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    // --------------------------------------------------
    // 1. MONTHLY REPORT
    // --------------------------------------------------

    public List<MonthlyReportResponse> getMonthlyReport(
            String from, String to) {

        YearMonth fromMonth = parseMonth(from);
        YearMonth toMonth = parseMonth(to);

        if (fromMonth.isAfter(toMonth)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "'from' month cannot be after 'to' month");
        }

        long requestedMonths =
                ChronoUnit.MONTHS.between(fromMonth, toMonth) + 1;

        if (requestedMonths > MAX_REPORT_MONTHS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Report range cannot exceed 24 months");
        }

        Long userId = SecurityUtil.getCurrentUserId();

        LocalDateTime fromDate =
                fromMonth.atDay(1).atStartOfDay();

        LocalDateTime toDate =
                toMonth.plusMonths(1).atDay(1).atStartOfDay();

        List<MonthlyTransactionSummary> summaries =
                transactionRepository.findMonthlySummaryByUserAndDateRange(
                        userId,
                        TransactionType.INCOME,
                        TransactionType.EXPENSE,
                        fromDate,
                        toDate);

        Map<YearMonth, MonthlyTransactionSummary> summaryMap =
                new HashMap<>();

        for (MonthlyTransactionSummary summary : summaries) {
            YearMonth month = YearMonth.of(
                    summary.getYear(),
                    summary.getMonth());

            summaryMap.put(month, summary);
        }

        List<MonthlyReportResponse> reports = new ArrayList<>();

        YearMonth currentMonth = fromMonth;

        while (!currentMonth.isAfter(toMonth)) {

            MonthlyTransactionSummary summary =
                    summaryMap.get(currentMonth);

            BigDecimal income = BigDecimal.ZERO.setScale(2);
            BigDecimal expenses = BigDecimal.ZERO.setScale(2);

            if (summary != null) {
                income = summary.getIncome() != null
                        ? summary.getIncome()
                        : BigDecimal.ZERO.setScale(2);

                expenses = summary.getExpenses() != null
                        ? summary.getExpenses()
                        : BigDecimal.ZERO.setScale(2);
            }

            BigDecimal balance = income.subtract(expenses);

            reports.add(new MonthlyReportResponse(
                    currentMonth.getMonthValue(),
                    currentMonth.getYear(),
                    income,
                    expenses,
                    balance));

            currentMonth = currentMonth.plusMonths(1);
        }

        return reports;
    }

    // --------------------------------------------------
    // 2. CATEGORY SPENDING REPORT
    // --------------------------------------------------

    public List<CategoryReportResponse> getCategoryReport(
            int month, int year) {

        YearMonth selectedMonth = validateMonthAndYear(month, year);

        Long userId = SecurityUtil.getCurrentUserId();

        LocalDateTime fromDate =
                selectedMonth.atDay(1).atStartOfDay();

        LocalDateTime toDate =
                selectedMonth.plusMonths(1).atDay(1).atStartOfDay();

        List<CategoryExpenseSummary> summaries =
                transactionRepository.findExpenseSummaryByCategory(
                        userId,
                        TransactionType.EXPENSE,
                        fromDate,
                        toDate);

        BigDecimal totalExpenses = summaries.stream()
                .map(CategoryExpenseSummary::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryReportResponse> reports = new ArrayList<>();

        for (CategoryExpenseSummary summary : summaries) {

            BigDecimal amount = summary.getAmount() != null
                    ? summary.getAmount()
                    : BigDecimal.ZERO;

            BigDecimal percentage = BigDecimal.ZERO.setScale(2);

            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalExpenses, 2, RoundingMode.HALF_UP);
            }

            reports.add(new CategoryReportResponse(
                    summary.getCategoryId(),
                    summary.getCategoryName(),
                    amount,
                    percentage));
        }

        return reports;
    }

    // --------------------------------------------------
    // 3. BUDGET PERFORMANCE REPORT
    // --------------------------------------------------

    public List<BudgetReportResponse> getBudgetReport(
            int month, int year) {

        YearMonth selectedMonth = validateMonthAndYear(month, year);

        Long userId = SecurityUtil.getCurrentUserId();

        List<Budget> budgets =
                budgetRepository.findByUserIdAndMonthAndYearAndIsDeletedFalse(
                        userId, month, year);

        if (budgets.isEmpty()) {
            return List.of();
        }

        LocalDateTime fromDate =
                selectedMonth.atDay(1).atStartOfDay();

        LocalDateTime toDate =
                selectedMonth.plusMonths(1).atDay(1).atStartOfDay();

        List<CategoryExpenseSummary> expenseSummaries =
                transactionRepository.findExpenseSummaryByCategory(
                        userId,
                        TransactionType.EXPENSE,
                        fromDate,
                        toDate);

        Map<Long, BigDecimal> actualSpendingByCategory =
                new HashMap<>();

        for (CategoryExpenseSummary summary : expenseSummaries) {

            actualSpendingByCategory.put(
                    summary.getCategoryId(),
                    summary.getAmount() != null
                            ? summary.getAmount()
                            : BigDecimal.ZERO);
        }

        List<BudgetReportResponse> reports = new ArrayList<>();

        for (Budget budget : budgets) {

            Long categoryId = budget.getCategory().getId();

            BigDecimal budgetAmount = budget.getAmount();

            BigDecimal actualAmount =
                    actualSpendingByCategory.getOrDefault(
                            categoryId,
                            BigDecimal.ZERO);

            BigDecimal remainingAmount =
                    budgetAmount.subtract(actualAmount);

            BigDecimal utilizationPercentage =
                    actualAmount
                            .multiply(BigDecimal.valueOf(100))
                            .divide(
                                    budgetAmount,
                                    2,
                                    RoundingMode.HALF_UP);

            reports.add(new BudgetReportResponse(
                    budget.getId(),
                    categoryId,
                    budget.getCategory().getName(),
                    budgetAmount,
                    actualAmount,
                    remainingAmount,
                    utilizationPercentage));
        }

        return reports;
    }

    // --------------------------------------------------
    // VALIDATION HELPERS
    // --------------------------------------------------

    private YearMonth parseMonth(String value) {

        try {
            return YearMonth.parse(value, MONTH_FORMATTER);

        } catch (DateTimeParseException | NullPointerException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid month format. Expected YYYY-MM");
        }
    }

    private YearMonth validateMonthAndYear(int month, int year) {

        if (month < 1 || month > 12) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Month must be between 1 and 12");
        }

        if (year < 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Year must be 2000 or later");
        }

        return YearMonth.of(year, month);
    }
}
