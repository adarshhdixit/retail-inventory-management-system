package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;

@Data
public class PaymentConfirmDTO {
    private Long orderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}