package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;

@Data
public class ProductVariantResponseDTO {
    private Long id;
    private String colorName;
    private Integer quantity;
}