package com.fintrack.dto;

import java.math.BigDecimal;

public class DashboardCategoryBreakdownResponse {

    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;

    public DashboardCategoryBreakdownResponse() {
    }

    public DashboardCategoryBreakdownResponse(
            Long categoryId,
            String categoryName,
            BigDecimal amount) {

        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.amount = amount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}