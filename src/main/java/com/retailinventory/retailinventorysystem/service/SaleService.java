package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.SaleResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.entity.Sale;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import com.retailinventory.retailinventorysystem.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    private SaleResponseDTO convertToDTO(Sale sale) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setProductName(sale.getProduct().getName());
        dto.setQuantitySold(sale.getQuantitySold());
        dto.setTotalAmount(sale.getProduct().getPrice() * sale.getQuantitySold());
        dto.setSaleDate(sale.getSaleDate());
        return dto;
    }

    public List<SaleResponseDTO> getAllSales() {
        return saleRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SaleResponseDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id " + id));
        return convertToDTO(sale);
    }

    @Transactional
    public SaleResponseDTO createSale(Sale sale) {
        Long productId = sale.getProduct().getId();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));

        if (product.getQuantity() < sale.getQuantitySold()) {
            throw new IllegalArgumentException(
                    "Not enough stock for " + product.getName() +
                            ". Available: " + product.getQuantity() +
                            ", Requested: " + sale.getQuantitySold());
        }

        product.setQuantity(product.getQuantity() - sale.getQuantitySold());
        productRepository.save(product);

        sale.setProduct(product);
        sale.setSaleDate(LocalDateTime.now());

        Sale savedSale = saleRepository.save(sale);
        return convertToDTO(savedSale);
    }

    public Map<String, Object> getSalesSummary() {
        List<Sale> allSales = saleRepository.findAll();

        int totalItemsSold = 0;
        double totalRevenue = 0.0;

        for (Sale sale : allSales) {
            totalItemsSold += sale.getQuantitySold();
            totalRevenue += sale.getProduct().getPrice() * sale.getQuantitySold();
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSales", allSales.size());
        summary.put("totalItemsSold", totalItemsSold);
        summary.put("totalRevenue", totalRevenue);

        return summary;
    }

    public List<Map<String, Object>> getTopSellingProducts() {
        List<Sale> allSales = saleRepository.findAll();

        Map<String, Integer> unitsSoldByProduct = new HashMap<>();

        for (Sale sale : allSales) {
            String productName = sale.getProduct().getName();
            int quantity = sale.getQuantitySold();

            unitsSoldByProduct.put(
                    productName,
                    unitsSoldByProduct.getOrDefault(productName, 0) + quantity
            );
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : unitsSoldByProduct.entrySet()) {
            Map<String, Object> row = new HashMap<>();
            row.put("productName", entry.getKey());
            row.put("totalUnitsSold", entry.getValue());
            result.add(row);
        }

        result.sort((a, b) -> (int) b.get("totalUnitsSold") - (int) a.get("totalUnitsSold"));

        return result;
    }
}