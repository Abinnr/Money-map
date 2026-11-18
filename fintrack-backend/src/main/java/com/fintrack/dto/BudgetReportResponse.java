
package com.fintrack.dto;

import java.math.BigDecimal;

public class BudgetReportResponse {

    private final Long budgetId;
    private final Long categoryId;
    private final String categoryName;
    private final BigDecimal budgetAmount;
    private final BigDecimal actualAmount;
    private final BigDecimal remainingAmount;
    private final BigDecimal utilizationPercentage;

    public BudgetReportResponse(
            Long budgetId,
            Long categoryId,
            String categoryName,
            BigDecimal budgetAmount,
            BigDecimal actualAmount,
            BigDecimal remainingAmount,
            BigDecimal utilizationPercentage) {

        this.budgetId = budgetId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.budgetAmount = budgetAmount;
        this.actualAmount = actualAmount;
        this.remainingAmount = remainingAmount;
        this.utilizationPercentage = utilizationPercentage;
    }

    public Long getBudgetId() {
        return budgetId;
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

    public BigDecimal getUtilizationPercentage() {
        return utilizationPercentage;
    }
}
