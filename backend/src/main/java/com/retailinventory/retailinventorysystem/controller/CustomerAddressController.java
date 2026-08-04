package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.entity.CustomerAddress;
import com.retailinventory.retailinventorysystem.entity.User;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.UserRepository;
import com.retailinventory.retailinventorysystem.service.CustomerAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class CustomerAddressController {

    @Autowired
    private CustomerAddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<CustomerAddress> getMyAddresses(Authentication authentication) {
        return addressService.getAddressesForCustomer(getCustomerId(authentication));
    }

    @PostMapping
    public CustomerAddress addAddress(@RequestBody CustomerAddress address, Authentication authentication) {
        return addressService.addAddress(getCustomerId(authentication), address);
    }

    @PutMapping("/{id}")
    public CustomerAddress updateAddress(
            @PathVariable Long id,
            @RequestBody CustomerAddress address,
            Authentication authentication) {
        return addressService.updateAddress(id, getCustomerId(authentication), address);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id, Authentication authentication) {
        addressService.deleteAddress(id, getCustomerId(authentication));
    }

    @PatchMapping("/{id}/set-default")
    public void setDefaultAddress(@PathVariable Long id, Authentication authentication) {
        addressService.setDefaultAddress(id, getCustomerId(authentication));
    }

    private Long getCustomerId(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}