package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;


@Data
public class OrderItemResponseDTO {
    private String productName;
    private Integer quantity;
    private Double priceAtPurchase;
}