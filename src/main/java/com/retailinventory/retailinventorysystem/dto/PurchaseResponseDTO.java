package com.retailinventory.retailinventorysystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponseDTO {
    private Long id;
    private String productName;
    private String supplierName;
    private Integer quantityPurchased;
    private Double totalCost;
    private LocalDateTime purchaseDate;
}