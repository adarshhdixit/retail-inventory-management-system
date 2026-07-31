package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.entity.Purchase;
import com.retailinventory.retailinventorysystem.entity.Supplier;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import com.retailinventory.retailinventorysystem.repository.PurchaseRepository;
import com.retailinventory.retailinventorysystem.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private PurchaseService purchaseService;

    private Product sampleProduct;
    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("Reynolds Ball Pen");
        sampleProduct.setQuantity(50);

        sampleSupplier = new Supplier();
        sampleSupplier.setId(1L);
        sampleSupplier.setName("ABC Stationery Distributors");
    }

    @Test
    void createPurchase_increasesProductQuantity() {
        Purchase purchase = new Purchase();
        purchase.setProduct(sampleProduct);
        purchase.setSupplier(sampleSupplier);
        purchase.setQuantityPurchased(20);
        purchase.setTotalCost(200.0);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = purchaseService.createPurchase(purchase);

        assertEquals(70, sampleProduct.getQuantity());
        assertEquals("Reynolds Ball Pen", result.getProductName());
        assertEquals("ABC Stationery Distributors", result.getSupplierName());
    }
}