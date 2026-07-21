package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;


    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Page<Product> getLowStockProducts(Integer threshold, Pageable pageable) {
        return productRepository.findByQuantityLessThan(threshold, pageable);
    }
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }
    public Page<Product> searchProductsByName(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(keyword, pageable);
    }
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setCategory(updatedProduct.getCategory());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}