package com.fintrack.service;

import com.fintrack.dto.CategoryResponse;
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

        private CategoryResponse toResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
        }

        public CategoryResponse createCategory(
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

                Category SavedCategory=categoryRepository.save(category);

                return toResponse(SavedCategory);
        }

        public List<CategoryResponse> getAvailableCategories() {

        Long userId = SecurityUtil.getCurrentUserId();

        return categoryRepository
                .findAvailableCategories(userId)
                .stream()
                .map(this::toResponse)
                .toList();
        }

        public CategoryResponse getMyCategory(Long categoryId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Category category= categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"
                        )
                );
                return toResponse(category);
        }
}