package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.CustomerAddress;
import com.retailinventory.retailinventorysystem.entity.User;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.CustomerAddressRepository;
import com.retailinventory.retailinventorysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerAddressService {

    @Autowired
    private CustomerAddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CustomerAddress> getAddressesForCustomer(Long customerId) {
        return addressRepository.findByCustomerId(customerId);
    }

    @Transactional
    public CustomerAddress addAddress(Long customerId, CustomerAddress newAddress) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        newAddress.setCustomer(customer);

        List<CustomerAddress> existing = addressRepository.findByCustomerId(customerId);
        if (existing.isEmpty()) {
            newAddress.setIsDefault(true);
        } else if (newAddress.getIsDefault() == null) {
            newAddress.setIsDefault(false);
        }

        return addressRepository.save(newAddress);
    }

    @Transactional
    public CustomerAddress updateAddress(Long addressId, Long customerId, CustomerAddress updated) {
        CustomerAddress address = getOwnedAddress(addressId, customerId);

        address.setLabel(updated.getLabel());
        address.setHouseNumber(updated.getHouseNumber());
        address.setStreetName(updated.getStreetName());
        address.setLandmark(updated.getLandmark());
        address.setLatitude(updated.getLatitude());
        address.setLongitude(updated.getLongitude());

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long customerId) {
        CustomerAddress address = getOwnedAddress(addressId, customerId);
        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long addressId, Long customerId) {
        List<CustomerAddress> all = addressRepository.findByCustomerId(customerId);
        for (CustomerAddress addr : all) {
            addr.setIsDefault(addr.getId().equals(addressId));
            addressRepository.save(addr);
        }
    }

    private CustomerAddress getOwnedAddress(Long addressId, Long customerId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("This address does not belong to you");
        }

        return address;
    }
}