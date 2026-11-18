package com.fintrack.controller;

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
            @RequestParam String to
    ) {
        return reportsService.getMonthlyReport(from, to);
    }
}