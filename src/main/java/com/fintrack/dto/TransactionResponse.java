package com.fintrack.dto;

import com.fintrack.entity.CategoryType;
import com.fintrack.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private String description;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long categoryId;
    private String categoryName;
    private CategoryType categoryType;

    public TransactionResponse() {
    }

    public TransactionResponse(
            Long id,
            BigDecimal amount,
            TransactionType type,
            String description,
            LocalDateTime transactionDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Long categoryId,
            String categoryName,
            CategoryType categoryType) {

        this.id = id;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.transactionDate = transactionDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryType = categoryType;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public CategoryType getCategoryType() {
        return categoryType;
    }
}