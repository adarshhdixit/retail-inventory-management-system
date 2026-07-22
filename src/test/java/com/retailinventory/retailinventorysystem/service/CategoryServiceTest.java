package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Category;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.CategoryRepository;
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
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1L);
        sampleCategory.setName("Writing Instruments");
        sampleCategory.setDescription("Pens, pencils, markers");
    }

    @Test
    void getCategoryById_whenExists_returnsCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));

        Category result = categoryService.getCategoryById(1L);

        assertEquals("Writing Instruments", result.getName());
        verify(categoryRepository, times(1)).findById(1L);
    }

    @Test
    void getCategoryById_whenNotFound_throwsException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryById(99L));
    }

    @Test
    void createCategory_savesAndReturnsCategory() {
        when(categoryRepository.save(sampleCategory)).thenReturn(sampleCategory);

        Category result = categoryService.createCategory(sampleCategory);

        assertEquals("Writing Instruments", result.getName());
        verify(categoryRepository, times(1)).save(sampleCategory);
    }

    @Test
    void deleteCategory_callsRepositoryDelete() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));

        categoryService.deleteCategory(1L);

        verify(categoryRepository, times(1)).delete(sampleCategory);
    }
}