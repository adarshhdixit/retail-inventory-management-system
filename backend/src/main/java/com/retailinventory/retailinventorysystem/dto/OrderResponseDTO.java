package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private Double totalAmount;
    private String status;
    private String razorpayOrderId;
    private LocalDateTime createdAt;
    private String shippingAddress;
    private List<OrderItemResponseDTO> items;
    private String deliveryPersonName;
    private String customerName;
    private String phone;
}