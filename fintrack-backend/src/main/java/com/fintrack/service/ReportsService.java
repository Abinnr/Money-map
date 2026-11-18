package com.fintrack.service;

import com.fintrack.dto.MonthlyReportResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.projection.MonthlyTransactionSummary;
import com.fintrack.security.SecurityUtil;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    public ReportsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<MonthlyReportResponse> getMonthlyReport(
            String from,
            String to
    ) {

        YearMonth fromMonth = parseMonth(from);
        YearMonth toMonth = parseMonth(to);

        if (fromMonth.isAfter(toMonth)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "'from' month cannot be after 'to' month"
            );
        }

        long requestedMonths =
                ChronoUnit.MONTHS.between(fromMonth, toMonth) + 1;

        if (requestedMonths > MAX_REPORT_MONTHS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Report range cannot exceed 24 months"
            );
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
                        toDate
                );

        Map<YearMonth, MonthlyTransactionSummary> summaryMap =
                new HashMap<>();

        for (MonthlyTransactionSummary summary : summaries) {

            YearMonth month = YearMonth.of(
                    summary.getYear(),
                    summary.getMonth()
            );

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

            reports.add(
                    new MonthlyReportResponse(
                            currentMonth.getMonthValue(),
                            currentMonth.getYear(),
                            income,
                            expenses,
                            balance
                    )
            );

            currentMonth = currentMonth.plusMonths(1);
        }

        return reports;
    }

    private YearMonth parseMonth(String value) {

        try {
            return YearMonth.parse(value, MONTH_FORMATTER);

        } catch (DateTimeParseException | NullPointerException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid month format. Expected YYYY-MM"
            );
        }
    }
}