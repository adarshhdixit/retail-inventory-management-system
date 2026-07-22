package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Supplier;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        sampleSupplier = new Supplier();
        sampleSupplier.setId(1L);
        sampleSupplier.setName("ABC Stationery Distributors");
        sampleSupplier.setEmail("ramesh@abcstationery.com");
    }

    @Test
    void getSupplierById_whenExists_returnsSupplier() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));

        Supplier result = supplierService.getSupplierById(1L);

        assertEquals("ABC Stationery Distributors", result.getName());
    }

    @Test
    void getSupplierById_whenNotFound_throwsException() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.getSupplierById(99L));
    }

    @Test
    void deleteSupplier_callsRepositoryDelete() {
        supplierService.deleteSupplier(1L);

        verify(supplierRepository, times(1)).deleteById(1L);
    }
}