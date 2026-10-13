package com.fintrack.dto;

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

    public TransactionResponse() {
    }

    public TransactionResponse(
            Long id,
            BigDecimal amount,
            TransactionType type,
            String description,
            LocalDateTime transactionDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.transactionDate = transactionDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
}