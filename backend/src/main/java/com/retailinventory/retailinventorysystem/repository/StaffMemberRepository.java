package com.retailinventory.retailinventorysystem.repository;

import com.retailinventory.retailinventorysystem.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {
}