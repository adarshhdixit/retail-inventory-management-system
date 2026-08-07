package com.retailinventory.retailinventorysystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.retailinventory.retailinventorysystem.dto.ProductVariantResponseDTO;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String categoryName;
    private String supplierName;
    private Long categoryId;
    private Long supplierId;
    private String subCategory;
    private List<ProductVariantResponseDTO> variants;
}