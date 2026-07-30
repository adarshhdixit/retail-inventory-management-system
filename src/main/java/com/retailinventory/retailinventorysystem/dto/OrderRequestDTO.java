package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;
import java.util.List;


@Data
public class OrderRequestDTO {
    private String shippingAddress;
    private String phone;
    private Double customerLatitude;
    private Double customerLongitude;
    private List<OrderItemRequestDTO> items;
}