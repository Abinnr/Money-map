package com.fintrack.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryResponse {

    private int month;
    private int year;

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;

    private List<DashboardCategoryBreakdownResponse> categoryBreakdown;

    private List<DashboardBudgetResponse> budgetVsActual;


    public DashboardSummaryResponse() {
    }


    public DashboardSummaryResponse(
            int month,
            int year,
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal balance,
            List<DashboardCategoryBreakdownResponse> categoryBreakdown,
            List<DashboardBudgetResponse> budgetVsActual) {

        this.month = month;
        this.year = year;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.balance = balance;
        this.categoryBreakdown = categoryBreakdown;
        this.budgetVsActual = budgetVsActual;
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


    public List<DashboardCategoryBreakdownResponse> getCategoryBreakdown() {
        return categoryBreakdown;
    }


    public List<DashboardBudgetResponse> getBudgetVsActual() {
        return budgetVsActual;
    }
}