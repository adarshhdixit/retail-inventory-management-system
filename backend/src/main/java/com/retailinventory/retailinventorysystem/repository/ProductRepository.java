package com.retailinventory.retailinventorysystem.repository;

import com.retailinventory.retailinventorysystem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByQuantityLessThan(Integer threshold, Pageable pageable);
    long countByQuantityLessThan(Integer threshold);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByQuantityLessThanAndActiveTrue(Integer threshold, Pageable pageable);
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword, Pageable pageable);

    List<Product> findByPopularTrueAndActiveTrue();
}