package com.retailinventory.retailinventorysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @NotNull(message = "Product is required")
    private Product product;

    @Positive(message = "Quantity sold must be greater than zero")
    @Column(nullable = false)
    private Integer quantitySold;

    @Column(nullable = false)
    private LocalDateTime saleDate;
}