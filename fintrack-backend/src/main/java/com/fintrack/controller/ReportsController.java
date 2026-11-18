
package com.fintrack.controller;

import com.fintrack.dto.BudgetReportResponse;
import com.fintrack.dto.CategoryReportResponse;
import com.fintrack.dto.MonthlyReportResponse;
import com.fintrack.service.ReportsService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/monthly")
    public List<MonthlyReportResponse> getMonthlyReport(
            @RequestParam String from,
            @RequestParam String to) {

        return reportsService.getMonthlyReport(from, to);
    }

    @GetMapping("/categories")
    public List<CategoryReportResponse> getCategoryReport(
            @RequestParam int month,
            @RequestParam int year) {

        return reportsService.getCategoryReport(month, year);
    }

    @GetMapping("/budgets")
    public List<BudgetReportResponse> getBudgetReport(
            @RequestParam int month,
            @RequestParam int year) {

        return reportsService.getBudgetReport(month, year);
    }
}
