package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.dto.DashboardResponseDTO;
import com.retailinventory.retailinventorysystem.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "2. Dashboard", description = "Aggregate statistics across the whole system")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public DashboardResponseDTO getDashboard() {
        return dashboardService.getDashboardStats();
    }
}