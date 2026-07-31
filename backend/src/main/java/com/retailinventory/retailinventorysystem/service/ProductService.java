package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.ProductResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setSupplierName(product.getSupplier() != null ? product.getSupplier().getName() : null);
        return dto;
    }

    public Page<ProductResponseDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> getLowStockProducts(Integer threshold, Pageable pageable) {
        return productRepository.findByQuantityLessThan(threshold, pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> searchProductsByName(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(keyword, pageable).map(this::convertToDTO);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        return convertToDTO(product);
    }

    public ProductResponseDTO createProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductResponseDTO updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setSupplier(updatedProduct.getSupplier());

        Product savedProduct = productRepository.save(existingProduct);
        return convertToDTO(savedProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}