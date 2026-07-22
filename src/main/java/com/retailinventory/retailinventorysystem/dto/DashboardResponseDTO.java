package com.retailinventory.retailinventorysystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {
    private long totalProducts;
    private long totalCategories;
    private long totalSuppliers;
    private long totalSales;
    private long totalPurchases;
    private double totalRevenue;
    private long lowStockProductCount;
}