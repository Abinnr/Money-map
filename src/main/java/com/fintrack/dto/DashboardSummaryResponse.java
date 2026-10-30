package com.fintrack.dto;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private int month;
    private int year;

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(
            int month,
            int year,
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal balance) {

        this.month = month;
        this.year = year;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.balance = balance;
    }

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}