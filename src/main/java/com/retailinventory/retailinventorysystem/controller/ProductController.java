package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public Page<Product> getAllProducts(
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "id"
            ) Pageable pageable) {

        return productService.getAllProducts(pageable);
    }

    @GetMapping("/low-stock")
    public Page<Product> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold,
            Pageable pageable) {

        return productService.getLowStockProducts(threshold, pageable);
    }
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/by-category/{categoryId}")
    public Page<Product> getProductsByCategory(
            @PathVariable Long categoryId,
            Pageable pageable) {

        return productService.getProductsByCategory(categoryId, pageable);
    }
    @GetMapping("/search")
    public Page<Product> searchProducts(@RequestParam String keyword, Pageable pageable) {

        return productService.searchProductsByName(keyword, pageable);
    }

    @PostMapping
    public Product createProduct(@Valid@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @Valid@RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product with id " + id + " deleted successfully.";
    }
}