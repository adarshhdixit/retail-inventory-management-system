package com.retailinventory.retailinventorysystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "customer_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private String label; // e.g. "Home", "Friend's place"

    @Column(nullable = false)
    private String houseNumber;

    @Column(nullable = false)
    private String streetName;

    @Column(nullable = false)
    private String landmark;


    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private Boolean isDefault = Boolean.FALSE;
}