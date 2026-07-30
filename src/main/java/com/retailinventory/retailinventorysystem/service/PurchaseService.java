package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.dto.PurchaseResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Product;
import com.retailinventory.retailinventorysystem.entity.Purchase;
import com.retailinventory.retailinventorysystem.entity.Supplier;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import com.retailinventory.retailinventorysystem.repository.PurchaseRepository;
import com.retailinventory.retailinventorysystem.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    private PurchaseResponseDTO convertToDTO(Purchase purchase) {
        PurchaseResponseDTO dto = new PurchaseResponseDTO();
        dto.setId(purchase.getId());
        dto.setProductName(purchase.getProduct().getName());
        dto.setSupplierName(purchase.getSupplier().getName());
        dto.setQuantityPurchased(purchase.getQuantityPurchased());
        dto.setTotalCost(purchase.getTotalCost());
        dto.setPurchaseDate(purchase.getPurchaseDate());
        return dto;
    }

    public List<PurchaseResponseDTO> getAllPurchases() {
        return purchaseRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PurchaseResponseDTO getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id " + id));
        return convertToDTO(purchase);
    }

    @Transactional
    public PurchaseResponseDTO createPurchase(Purchase purchase) {
        Long productId = purchase.getProduct().getId();
        Long supplierId = purchase.getSupplier().getId();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id " + supplierId));

        product.setQuantity(product.getQuantity() + purchase.getQuantityPurchased());
        productRepository.save(product);

        purchase.setProduct(product);
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(LocalDateTime.now());

        Purchase savedPurchase = purchaseRepository.save(purchase);
        return convertToDTO(savedPurchase);
    }
}