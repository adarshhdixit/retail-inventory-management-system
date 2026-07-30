package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.dto.PurchaseResponseDTO;
import com.retailinventory.retailinventorysystem.entity.Purchase;
import com.retailinventory.retailinventorysystem.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "5. Purchases", description = "Record inventory purchases from suppliers")
@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping
    public List<PurchaseResponseDTO> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @GetMapping("/{id}")
    public PurchaseResponseDTO getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id);
    }

    @PostMapping
    public PurchaseResponseDTO createPurchase(@Valid @RequestBody Purchase purchase) {
        return purchaseService.createPurchase(purchase);
    }
}