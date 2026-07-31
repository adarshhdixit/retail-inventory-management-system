package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.DashboardResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Sale;
import com.retailinventory.retailinventorysystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    private static final int LOW_STOCK_THRESHOLD = 10;

    public DashboardResponseDTO getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalSuppliers = supplierRepository.count();
        long totalSales = saleRepository.count();
        long totalPurchases = purchaseRepository.count();

        List<Sale> allSales = saleRepository.findAll();
        double totalRevenue = 0.0;
        for (Sale sale : allSales) {
            totalRevenue += sale.getProduct().getPrice() * sale.getQuantitySold();
        }

        long lowStockCount = productRepository.countByQuantityLessThan(LOW_STOCK_THRESHOLD);

        return new DashboardResponseDTO(
                totalProducts,
                totalCategories,
                totalSuppliers,
                totalSales,
                totalPurchases,
                totalRevenue,
                lowStockCount
        );
    }
}