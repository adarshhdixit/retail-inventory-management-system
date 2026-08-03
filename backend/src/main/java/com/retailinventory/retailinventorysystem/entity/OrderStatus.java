package com.retailinventory.retailinventorysystem.entity;

public enum OrderStatus {
    PENDING,           // order created, payment not yet confirmed
    PAID,              // payment successful, order confirmed
    OUT_FOR_DELIVERY,  // handed to delivery partner
    DELIVERED,         // completed
    CANCELLED           // only allowed before OUT_FOR_DELIVERY
}
