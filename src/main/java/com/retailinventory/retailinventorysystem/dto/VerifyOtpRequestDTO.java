package com.retailinventory.retailinventorysystem.dto;

import lombok.Data;

@Data
public class VerifyOtpRequestDTO {
    private String phone;
    private String otp;
    private String name;
}