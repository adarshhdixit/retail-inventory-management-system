package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.OtpVerification;
import com.retailinventory.retailinventorysystem.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    public String generateAndSendOtp(String phone) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000)); // 6-digit OTP

        OtpVerification record = new OtpVerification();
        record.setPhone(phone);
        record.setOtp(otp);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        record.setVerified(false);
        otpRepository.save(record);

        // DEV MODE: log instead of sending real SMS.
        // TODO: replace with real SMS provider once DLT registration is complete.
        System.out.println("=== DEV MODE OTP === Phone: " + phone + " | OTP: " + otp + " ===");

        return otp; // returned only so the API response can show it in dev mode
    }

    public boolean verifyOtp(String phone, String submittedOtp) {
        OtpVerification record = otpRepository.findTopByPhoneOrderByIdDesc(phone)
                .orElse(null);

        if (record == null) return false;
        if (record.isVerified()) return false;
        if (LocalDateTime.now().isAfter(record.getExpiresAt())) return false;
        if (!record.getOtp().equals(submittedOtp)) return false;

        record.setVerified(true);
        otpRepository.save(record);
        return true;
    }
}