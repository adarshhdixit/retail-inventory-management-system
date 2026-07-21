package com.retailinventory.retailinventorysystem.service;

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

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id " + id));
    }

    @Transactional
    public Purchase createPurchase(Purchase purchase) {
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

        return purchaseRepository.save(purchase);
    }
}