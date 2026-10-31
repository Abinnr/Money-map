package com.fintrack.controller;

import com.fintrack.dto.DashboardSummaryResponse;
import com.fintrack.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardSummaryResponse getMonthlySummary(
            @RequestParam int month,
            @RequestParam int year) {

        return dashboardService.getMonthlySummary(month, year);
    }
}