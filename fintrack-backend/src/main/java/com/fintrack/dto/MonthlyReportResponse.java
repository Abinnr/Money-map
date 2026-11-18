package com.fintrack.dto;

import java.math.BigDecimal;

public class MonthlyReportResponse {

    private final int month;
    private final int year;
    private final BigDecimal income;
    private final BigDecimal expenses;
    private final BigDecimal balance;

    public MonthlyReportResponse(
            int month,
            int year,
            BigDecimal income,
            BigDecimal expenses,
            BigDecimal balance
    ) {
        this.month = month;
        this.year = year;
        this.income = income;
        this.expenses = expenses;
        this.balance = balance;
    }

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpenses() {
        return expenses;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}