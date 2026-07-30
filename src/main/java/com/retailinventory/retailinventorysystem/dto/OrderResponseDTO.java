package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderResponseDTO {
    private Long id;
    private Double totalAmount;
    private String status;
    private String razorpayOrderId;
    private LocalDateTime createdAt;
}