package com.fintrack.controller;

import com.fintrack.dto.BudgetResponse;
import com.fintrack.dto.CreateBudgetRequest;
import com.fintrack.dto.UpdateBudgetRequest;
import com.fintrack.service.BudgetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService) {

        this.budgetService = budgetService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse createBudget(
            @Valid @RequestBody CreateBudgetRequest request) {

        return budgetService.createBudget(request);
    }

    @GetMapping
    public List<BudgetResponse> getMyBudgets() {

        return budgetService.getMyBudgets();
    }

    @GetMapping("/{id}")
    public BudgetResponse getMyBudget(
            @PathVariable Long id) {

        return budgetService.getMyBudget(id);
    }

    @PutMapping("/{id}")
    public BudgetResponse updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request) {

        return budgetService.updateBudget(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(
            @PathVariable Long id) {

        budgetService.deleteBudget(id);
    }
}