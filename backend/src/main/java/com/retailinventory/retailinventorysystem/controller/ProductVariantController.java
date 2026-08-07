package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.ProductVariant;
import com.retailinventory.retailinventorysystem.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
public class ProductVariantController {

    @Autowired
    private ProductVariantService variantService;

    @GetMapping
    public List<ProductVariant> getVariants(@PathVariable Long productId) {
        return variantService.getVariantsForProduct(productId);
    }

    @PostMapping
    public ProductVariant addVariant(
            @PathVariable Long productId,
            @RequestParam String colorName,
            @RequestParam Integer quantity) {
        return variantService.addVariant(productId, colorName, quantity);
    }

    @PutMapping("/{variantId}")
    public ProductVariant updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestParam String colorName,
            @RequestParam Integer quantity) {
        return variantService.updateVariant(variantId, colorName, quantity);
    }

    @DeleteMapping("/{variantId}")
    public void deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        variantService.deleteVariant(variantId);
    }
}