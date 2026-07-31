package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.dto.OrderRequestDTO;
import com.retailinventory.retailinventorysystem.dto.OrderResponseDTO;
import com.retailinventory.retailinventorysystem.dto.PaymentConfirmDTO;
import com.retailinventory.retailinventorysystem.entity.User;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.UserRepository;
import com.retailinventory.retailinventorysystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private com.retailinventory.retailinventorysystem.config.ShopConfig shopConfig;

    @PostMapping
    public OrderResponseDTO createOrder(@RequestBody OrderRequestDTO request, Authentication authentication) throws Exception {
        Long customerId = getCustomerIdFromAuth(authentication);
        return orderService.createOrder(request, customerId);
    }

    @PostMapping("/confirm-payment")
    public String confirmPayment(@RequestBody PaymentConfirmDTO dto) {
        orderService.confirmPayment(dto.getOrderId(), dto.getRazorpayPaymentId(), dto.getRazorpaySignature());
        return "Payment confirmed, order marked as paid.";
    }
    @GetMapping("/check-serviceability")
    public String checkServiceability(@RequestParam Double lat, @RequestParam Double lng) {
        double distance = com.retailinventory.retailinventorysystem.util.DistanceUtil.calculateDistanceKm(
                shopConfig.getLatitude(),
                shopConfig.getLongitude(),
                lat,
                lng
        );

        if (distance > shopConfig.getDeliveryRadiusKm()) {
            return "OUT_OF_RANGE";
        }
        return "DELIVERABLE";
    }

    private Long getCustomerIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}