package com.retailinventory.retailinventorysystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class ShopConfig {

    @Value("${shop.latitude}")
    private double latitude;

    @Value("${shop.longitude}")
    private double longitude;

    @Value("${shop.delivery.radius.km}")
    private double deliveryRadiusKm;
}