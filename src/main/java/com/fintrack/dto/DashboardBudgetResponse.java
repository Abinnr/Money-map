package com.fintrack.dto;

import java.math.BigDecimal;

public class DashboardBudgetResponse {

    private Long categoryId;
    private String categoryName;
    private BigDecimal budgetAmount;
    private BigDecimal actualAmount;
    private BigDecimal remainingAmount;
    private BigDecimal percentageUsed;

    public DashboardBudgetResponse() {
    }

    public DashboardBudgetResponse(
            Long categoryId,
            String categoryName,
            BigDecimal budgetAmount,
            BigDecimal actualAmount,
            BigDecimal remainingAmount,
            BigDecimal percentageUsed) {

        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.budgetAmount = budgetAmount;
        this.actualAmount = actualAmount;
        this.remainingAmount = remainingAmount;
        this.percentageUsed = percentageUsed;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getBudgetAmount() {
        return budgetAmount;
    }

    public BigDecimal getActualAmount() {
        return actualAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public BigDecimal getPercentageUsed() {
        return percentageUsed;
    }
}