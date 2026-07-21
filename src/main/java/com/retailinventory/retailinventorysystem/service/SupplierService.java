package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Supplier;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id " + id));
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        Supplier existingSupplier = getSupplierById(id);

        existingSupplier.setName(updatedSupplier.getName());
        existingSupplier.setContactPerson(updatedSupplier.getContactPerson());
        existingSupplier.setEmail(updatedSupplier.getEmail());
        existingSupplier.setPhoneNumber(updatedSupplier.getPhoneNumber());

        return supplierRepository.save(existingSupplier);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }
}