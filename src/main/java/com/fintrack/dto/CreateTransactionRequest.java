package com.fintrack.dto;

import com.fintrack.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CreateTransactionRequest {

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

    public CreateTransactionRequest() {
    }

    // getters and setters
}