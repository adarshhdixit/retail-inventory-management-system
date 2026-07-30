package com.retailinventory.retailinventorysystem.repository;

import com.retailinventory.retailinventorysystem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByQuantityLessThan(Integer threshold, Pageable pageable);
    long countByQuantityLessThan(Integer threshold);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}