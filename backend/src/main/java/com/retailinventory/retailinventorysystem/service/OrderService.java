package com.retailinventory.retailinventorysystem.service;

import com.razorpay.RazorpayException;
import com.retailinventory.retailinventorysystem.dto.OrderRequestDTO;
import com.retailinventory.retailinventorysystem.dto.OrderResponseDTO;
import com.retailinventory.retailinventorysystem.entity.*;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.OrderRepository;
import com.retailinventory.retailinventorysystem.repository.ProductRepository;
import com.retailinventory.retailinventorysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.retailinventory.retailinventorysystem.dto.OrderItemResponseDTO;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RazorpayService razorpayService;
    @Autowired
    private com.retailinventory.retailinventorysystem.config.ShopConfig shopConfig;
    @Autowired
    private com.retailinventory.retailinventorysystem.repository.ProductVariantRepository variantRepository;

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request, Long customerId) throws RazorpayException {
        double distance = com.retailinventory.retailinventorysystem.util.DistanceUtil.calculateDistanceKm(
                shopConfig.getLatitude(),
                shopConfig.getLongitude(),
                request.getCustomerLatitude(),
                request.getCustomerLongitude()
        );

        if (distance > shopConfig.getDeliveryRadiusKm()) {
            throw new IllegalArgumentException(
                    "Sorry, we currently only deliver within " + shopConfig.getDeliveryRadiusKm() + " km of our shop. " +
                            "Your location is " + Math.round(distance) + " km away."
            );
        }
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress());
        order.setPhone(request.getPhone());
        order.setCustomerLatitude(request.getCustomerLatitude());
        order.setCustomerLongitude(request.getCustomerLongitude());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;

        for (var itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            ProductVariant variant = null;
            if (itemReq.getVariantId() != null) {
                variant = variantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Color variant not found"));

                if (variant.getQuantity() < itemReq.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for " + product.getName() + " (" + variant.getColorName() + ")"
                    );
                }
            } else {
                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock for: " + product.getName());
                }
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setVariant(variant);
            item.setQuantity(itemReq.getQuantity());
            item.setPriceAtPurchase(product.getPrice());
            items.add(item);

            total += product.getPrice() * itemReq.getQuantity();
        }

        order.setItems(items);
        order.setTotalAmount(total);

        String razorpayOrderId = razorpayService.createRazorpayOrder(total);
        order.setRazorpayOrderId(razorpayOrderId);

        Order saved = orderRepository.save(order);

        OrderResponseDTO response = new OrderResponseDTO();
        response.setId(saved.getId());
        response.setTotalAmount(saved.getTotalAmount());
        response.setStatus(saved.getStatus().name());
        response.setRazorpayOrderId(saved.getRazorpayOrderId());
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }

    @Transactional
    public void confirmPayment(Long orderId, String paymentId, String signature) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean valid = razorpayService.verifyPayment(order.getRazorpayOrderId(), paymentId, signature);

        if (!valid) {
            throw new IllegalArgumentException("Payment verification failed");
        }

        order.setRazorpayPaymentId(paymentId);
        order.setRazorpaySignature(signature);
        order.setStatus(OrderStatus.PAID);

        // Reduce stock for each item
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                variant.setQuantity(variant.getQuantity() - item.getQuantity());
                variantRepository.save(variant);
            } else {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        orderRepository.save(order);
    }

    public List<OrderResponseDTO> getOrdersForCustomer(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        orders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        List<OrderResponseDTO> response = new ArrayList<>();

        for (Order order : orders) {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus().name());
            dto.setRazorpayOrderId(order.getRazorpayOrderId());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setCustomerName(order.getCustomer().getName());
            dto.setPhone(order.getPhone());
            dto.setDeliveryPersonName(order.getDeliveryPersonName());

            List<OrderItemResponseDTO> itemDtos = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPriceAtPurchase(item.getPriceAtPurchase());
                itemDto.setColorName(item.getVariant() != null ? item.getVariant().getColorName() : null);
                itemDtos.add(itemDto);
            }
            dto.setItems(itemDtos);

            response.add(dto);
        }

        return response;
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus newStatus, String deliveryPersonName) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        if (deliveryPersonName != null && !deliveryPersonName.isBlank()) {
            order.setDeliveryPersonName(deliveryPersonName);
        }

        Order saved = orderRepository.save(order);

        OrderResponseDTO response = new OrderResponseDTO();
        response.setId(saved.getId());
        response.setTotalAmount(saved.getTotalAmount());
        response.setStatus(saved.getStatus().name());
        response.setRazorpayOrderId(saved.getRazorpayOrderId());
        response.setCreatedAt(saved.getCreatedAt());
        response.setDeliveryPersonName(saved.getDeliveryPersonName());
        return response;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean allowed = switch (current) {
            case PENDING -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.OUT_FOR_DELIVERY || next == OrderStatus.CANCELLED;
            case OUT_FOR_DELIVERY -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false; // terminal states, no further transitions
        };

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Cannot change order status from " + current + " to " + next
            );
        }
    }

    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        List<OrderResponseDTO> response = new ArrayList<>();

        for (Order order : orders) {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus().name());
            dto.setRazorpayOrderId(order.getRazorpayOrderId());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setCustomerName(order.getCustomer().getName());
            dto.setPhone(order.getPhone());
            dto.setDeliveryPersonName(order.getDeliveryPersonName());

            List<OrderItemResponseDTO> itemDtos = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPriceAtPurchase(item.getPriceAtPurchase());
                itemDto.setColorName(item.getVariant() != null ? item.getVariant().getColorName() : null);
                itemDtos.add(itemDto);
            }
            dto.setItems(itemDtos);

            response.add(dto);
        }

        return response;
    }
}