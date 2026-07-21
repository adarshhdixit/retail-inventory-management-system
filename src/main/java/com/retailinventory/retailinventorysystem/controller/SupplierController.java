package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.Supplier;
import com.retailinventory.retailinventorysystem.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    public Supplier getSupplierById(@PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @PostMapping
    public Supplier createSupplier(@Valid @RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    @PutMapping("/{id}")
    public Supplier updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        return supplierService.updateSupplier(id, supplier);
    }

    @DeleteMapping("/{id}")
    public String deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return "Supplier with id " + id + " deleted successfully.";
    }
}