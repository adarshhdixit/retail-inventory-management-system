package com.retailinventory.retailinventorysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @NotNull(message = "Product is required")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @NotNull(message = "Supplier is required")
    private Supplier supplier;

    @Positive(message = "Quantity purchased must be greater than zero")
    @Column(nullable = false)
    private Integer quantityPurchased;

    @Positive(message = "Cost must be greater than zero")
    @Column(nullable = false)
    private Double totalCost;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;
}