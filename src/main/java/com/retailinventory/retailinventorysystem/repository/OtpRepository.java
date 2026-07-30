package com.retailinventory.retailinventorysystem.repository;

import com.retailinventory.retailinventorysystem.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByPhoneOrderByIdDesc(String phone);
}