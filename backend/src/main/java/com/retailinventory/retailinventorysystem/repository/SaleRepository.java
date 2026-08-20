package com.retailinventory.retailinventorysystem.repository;

import com.retailinventory.retailinventorysystem.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT s.product.id, SUM(s.quantitySold) as total FROM Sale s GROUP BY s.product.id ORDER BY total DESC")
    List<Object[]> findTopSellingProductIds();
}