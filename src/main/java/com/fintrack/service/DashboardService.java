package com.fintrack.service;

import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.entity.TransactionType;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.security.SecurityUtil;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public DashboardSummaryResponse getMonthlySummary(
            int month,
            int year) {

        Long userId = SecurityUtil.getCurrentUserId();

        LocalDate firstDay =
                LocalDate.of(year, month, 1);

        LocalDate firstDayOfNextMonth =
                firstDay.plusMonths(1);

        LocalDateTime from =
                firstDay.atStartOfDay();

        LocalDateTime to =
                firstDayOfNextMonth.atStartOfDay();

        BigDecimal totalIncome =
                transactionRepository
                        .sumAmountByUserAndTypeAndDateRange(
                                userId,
                                TransactionType.INCOME,
                                from,
                                to
                        );

        BigDecimal totalExpenses =
                transactionRepository
                        .sumAmountByUserAndTypeAndDateRange(
                                userId,
                                TransactionType.EXPENSE,
                                from,
                                to
                        );

        BigDecimal balance =
                totalIncome.subtract(totalExpenses);

        return new DashboardSummaryResponse(
                month,
                year,
                totalIncome,
                totalExpenses,
                balance
        );
    }
}