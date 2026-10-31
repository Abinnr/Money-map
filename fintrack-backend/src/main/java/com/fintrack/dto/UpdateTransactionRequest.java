package com.fintrack.dto;

import com.fintrack.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UpdateTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    private String description;

    @NotNull(message = "Transaction date is required")
    private LocalDateTime transactionDate;

    @NotNull(message = "Category is required")
    private Long categoryId;

    public UpdateTransactionRequest() {
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}