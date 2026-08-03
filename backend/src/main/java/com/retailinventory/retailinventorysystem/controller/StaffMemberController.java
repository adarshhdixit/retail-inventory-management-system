package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.StaffMember;
import com.retailinventory.retailinventorysystem.service.StaffMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffMemberController {

    @Autowired
    private StaffMemberService staffMemberService;

    @PostMapping
    public StaffMember addStaffMember(@RequestParam String name) {
        return staffMemberService.addStaffMember(name);
    }

    @GetMapping
    public List<StaffMember> getAllStaffMembers() {
        return staffMemberService.getAllStaffMembers();
    }
    @PutMapping("/{id}")
    public StaffMember updateStaffMember(@PathVariable Long id, @RequestParam String name) {
        return staffMemberService.updateStaffMember(id, name);
    }

    @DeleteMapping("/{id}")
    public void deleteStaffMember(@PathVariable Long id) {
        staffMemberService.deleteStaffMember(id);
    }
}