package com.retailinventory.retailinventorysystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponseDTO {
    private Long id;
    private String productName;
    private Integer quantitySold;
    private Double totalAmount;
    private LocalDateTime saleDate;
}