package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.ProductResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.retailinventory.retailinventorysystem.repository.ProductVariantRepository;
import com.retailinventory.retailinventorysystem.dto.ProductVariantResponseDTO;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository variantRepository;

    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setSupplierName(product.getSupplier() != null ? product.getSupplier().getName() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSupplierId(product.getSupplier() != null ? product.getSupplier().getId() : null);
        dto.setDeliverable(product.getDeliverable());
        dto.setSubCategory(product.getSubCategory());
        dto.setVariants(
                variantRepository.findByProductIdAndActiveTrue(product.getId()).stream()
                        .map(v -> {
                            ProductVariantResponseDTO vDto = new ProductVariantResponseDTO();
                            vDto.setId(v.getId());
                            vDto.setColorName(v.getColorName());
                            vDto.setQuantity(v.getQuantity());
                            return vDto;
                        })
                        .collect(java.util.stream.Collectors.toList())
        );
        return dto;
    }

    public Page<ProductResponseDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> getLowStockProducts(Integer threshold, Pageable pageable) {
        return productRepository.findByQuantityLessThanAndActiveTrue(threshold, pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::convertToDTO);
    }

    public Page<ProductResponseDTO> searchProductsByName(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword, pageable).map(this::convertToDTO);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        return convertToDTO(product);
    }

    public ProductResponseDTO createProduct(Product product) {
        if (product.getActive() == null){
            product.setActive(true);
        }
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
        existingProduct.setSubCategory(updatedProduct.getSubCategory());
        existingProduct.setDeliverable(updatedProduct.getDeliverable());

        Product savedProduct = productRepository.save(existingProduct);
        return convertToDTO(savedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        product.setActive(false);
        productRepository.save(product);
    }
}