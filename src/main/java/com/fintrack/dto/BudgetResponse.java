package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BudgetResponse {

    private Long id;
    private BigDecimal amount;
    private int month;
    private int year;

    private Long categoryId;
    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BudgetResponse() {
    }

    public BudgetResponse(
            Long id,
            BigDecimal amount,
            int month,
            int year,
            Long categoryId,
            String categoryName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}