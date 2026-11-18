
package com.fintrack.dto;

import java.math.BigDecimal;

public class CategoryReportResponse {

    private final Long categoryId;
    private final String categoryName;
    private final BigDecimal amount;
    private final BigDecimal percentage;

    public CategoryReportResponse(
            Long categoryId,
            String categoryName,
            BigDecimal amount,
            BigDecimal percentage) {

        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.amount = amount;
        this.percentage = percentage;
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

    public BigDecimal getPercentage() {
        return percentage;
    }
}
