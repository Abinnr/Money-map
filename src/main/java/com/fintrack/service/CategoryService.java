package com.fintrack.service;

import com.fintrack.dto.CreateCategoryRequest;
import com.fintrack.entity.Category;
import com.fintrack.entity.User;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.SecurityUtil;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserRepository userRepository) {

        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public Category createCategory(
            CreateCategoryRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Category category = new Category();

        category.setName(request.getName());
        category.setType(request.getType());

        category.setUser(user);

        category.setActive(true);

        LocalDateTime now = LocalDateTime.now();

        category.setCreatedAt(now);
        category.setUpdatedAt(now);

        return categoryRepository.save(category);
    }

    public List<Category> getAvailableCategories() {

        Long userId = SecurityUtil.getCurrentUserId();

        return categoryRepository
                .findAvailableCategories(userId);
    }

    public Category getMyCategory(Long categoryId) {

        Long userId = SecurityUtil.getCurrentUserId();

        return categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"
                        )
                );
    }
}