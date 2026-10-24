package com.fintrack.controller;

import com.fintrack.dto.CreateTransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.dto.UpdateTransactionRequest;
import com.fintrack.entity.Transaction;
import com.fintrack.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {

        this.transactionService = transactionService;
    }

    @PostMapping  // to create a transaction.
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(
            @Valid @RequestBody CreateTransactionRequest request) {

        return transactionService.createTransaction(request);
    }

    @GetMapping  // to retrieve all transaction list.
    public List<TransactionResponse> getMyTransactions() {

        return transactionService.getMyTransactions();
    }

    @GetMapping("/{id}")  // to retreive a particular selected trancation 
    public TransactionResponse getMyTransaction(
            @PathVariable Long id) {

        return transactionService.getMyTransaction(id);
    }

    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequest request) {

        return transactionService.updateTransaction(
                id,
                request
        );
    }
}