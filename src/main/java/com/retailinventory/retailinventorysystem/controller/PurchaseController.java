package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.Purchase;
import com.retailinventory.retailinventorysystem.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @GetMapping("/{id}")
    public Purchase getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id);
    }

    @PostMapping
    public Purchase createPurchase(@Valid @RequestBody Purchase purchase) {
        return purchaseService.createPurchase(purchase);
    }
}