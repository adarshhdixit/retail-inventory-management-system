package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.StaffMember;
import com.retailinventory.retailinventorysystem.repository.StaffMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffMemberService {

    @Autowired
    private StaffMemberRepository staffMemberRepository;

    public StaffMember addStaffMember(String name) {
        StaffMember staff = new StaffMember();
        staff.setName(name);
        return staffMemberRepository.save(staff);
    }

    public List<StaffMember> getAllStaffMembers() {
        return staffMemberRepository.findAll();
    }
    public StaffMember updateStaffMember(Long id, String name) {
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException("Staff member not found"));
        staff.setName(name);
        return staffMemberRepository.save(staff);
    }

    public void deleteStaffMember(Long id) {
        if (!staffMemberRepository.existsById(id)) {
            throw new com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException("Staff member not found");
        }
        staffMemberRepository.deleteById(id);
    }
}