package com.retailinventory.retailinventorysystem.service;

import com.retailinventory.retailinventorysystem.entity.Banner;
import com.retailinventory.retailinventorysystem.entity.Category;
import com.retailinventory.retailinventorysystem.exception.ResourceNotFoundException;
import com.retailinventory.retailinventorysystem.repository.BannerRepository;
import com.retailinventory.retailinventorysystem.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByActiveTrue();
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner createBanner(Banner banner) {
        if (banner.getCategory() != null && banner.getCategory().getId() != null) {
            Category category = categoryRepository.findById(banner.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            banner.setCategory(category);
        }
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner updated) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));

        banner.setTitle(updated.getTitle());
        banner.setSubtitle(updated.getSubtitle());
        banner.setImageUrl(updated.getImageUrl());
        banner.setButtonText(updated.getButtonText());
        if (updated.getActive() != null) {
            banner.setActive(updated.getActive());
        }
        if (updated.getType() != null) {
            banner.setType(updated.getType());
        }

        if (updated.getCategory() != null && updated.getCategory().getId() != null) {
            Category category = categoryRepository.findById(updated.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            banner.setCategory(category);
        } else {
            banner.setCategory(null);
        }

        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Banner not found");
        }
        bannerRepository.deleteById(id);
    }
}