package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Category;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
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
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Writing Instruments");

        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("Reynolds Ball Pen");
        sampleProduct.setPrice(10.0);
        sampleProduct.setQuantity(100);
        sampleProduct.setCategory(category);
    }

    @Test
    void getProductById_whenExists_returnsDTOWithCategoryName() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        var result = productService.getProductById(1L);

        assertEquals("Reynolds Ball Pen", result.getName());
        assertEquals("Writing Instruments", result.getCategoryName());
    }

    @Test
    void getProductById_whenNotFound_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(99L));
    }

    @Test
    void createProduct_savesAndReturnsDTO() {
        when(productRepository.save(sampleProduct)).thenReturn(sampleProduct);

        var result = productService.createProduct(sampleProduct);

        assertEquals("Reynolds Ball Pen", result.getName());
        verify(productRepository, times(1)).save(sampleProduct);
    }
}