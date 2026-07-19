package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.Sale;
import com.retailinventory.retailinventorysystem.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/{id}")
    public Sale getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSalesSummary() {
        return saleService.getSalesSummary();
    }
    @GetMapping("/top-selling")
    public List<Map<String, Object>> getTopSellingProducts() {
        return saleService.getTopSellingProducts();
    }
    @PostMapping
    public Sale createSale(@Valid @RequestBody Sale sale) {
        return saleService.createSale(sale);
    }
}