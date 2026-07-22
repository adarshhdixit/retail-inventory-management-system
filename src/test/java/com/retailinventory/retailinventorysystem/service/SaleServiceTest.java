package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.SaleResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.entity.Sale;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import com.retailinventory.retailinventorysystem.repository.SaleRepository;
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
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SaleService saleService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("Reynolds Ball Pen");
        sampleProduct.setPrice(10.0);
        sampleProduct.setQuantity(50);
    }

    @Test
    void createSale_withEnoughStock_reducesQuantityAndSaves() {
        Sale sale = new Sale();
        sale.setProduct(sampleProduct);
        sale.setQuantitySold(5);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaleResponseDTO result = saleService.createSale(sale);

        assertEquals(45, sampleProduct.getQuantity());
        assertEquals(5, result.getQuantitySold());
        verify(productRepository, times(1)).save(sampleProduct);
        verify(saleRepository, times(1)).save(any(Sale.class));
    }

    @Test
    void createSale_withInsufficientStock_throwsException() {
        Sale sale = new Sale();
        sale.setProduct(sampleProduct);
        sale.setQuantitySold(999);

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        assertThrows(IllegalArgumentException.class, () -> saleService.createSale(sale));
        verify(saleRepository, never()).save(any(Sale.class));
    }

    @Test
    void getSaleById_whenNotFound_throwsException() {
        when(saleRepository.findById(42L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleService.getSaleById(42L));
    }
}