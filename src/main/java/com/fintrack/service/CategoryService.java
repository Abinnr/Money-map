package com.fintrack.service;

import com.fintrack.dto.CategoryResponse;
import com.fintrack.dto.CreateCategoryRequest;
import com.fintrack.dto.UpdateCategoryRequest;
import com.fintrack.entity.Category;
import com.fintrack.entity.User;
import com.fintrack.exception.CategoryAlreadyExistsException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.SystemCategoryModificationException;
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

        
        // ENTITY → RESPONSE DTO
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


        //CREATE CATEGORY
        public CategoryResponse createCategory(
                CreateCategoryRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        boolean exists =
                categoryRepository
                        .existsByNameIgnoreCaseAndTypeAndUserIdAndIsActiveTrue(
                                request.getName(),
                                request.getType(),
                                userId
                        );

        if (exists) {
                throw new CategoryAlreadyExistsException(
                        "Category already exists"
                );
        }

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
        
        //GET ALL CATEGORY
        public List<CategoryResponse> getAvailableCategories() {

        Long userId = SecurityUtil.getCurrentUserId();

        return categoryRepository
                .findAvailableCategories(userId)
                .stream()
                .map(this::toResponse)
                .toList();
        }


        //GET ONE CATEGORY
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


        // UPDATE
    public CategoryResponse updateCategory(
            Long categoryId,
            UpdateCategoryRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        Category category =categoryRepository.findByIdAndUserId(categoryId,userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        boolean exists =
                categoryRepository
                        .existsByNameIgnoreCaseAndTypeAndUserIdAndIsActiveTrue(
                                request.getName(),
                                request.getType(),
                                userId
                        );

        if (exists &&
                (!category.getName().equalsIgnoreCase(request.getName())
                        || category.getType() != request.getType())) {

            throw new CategoryAlreadyExistsException(
                    "Category already exists"
            );
        }

        category.setName(request.getName());
        category.setType(request.getType());
        category.setUpdatedAt(LocalDateTime.now());

        Category updatedCategory =
                categoryRepository.save(category);

        return toResponse(updatedCategory);
    }

    // DELETE / SOFT DELETE
    public void deleteCategory(Long categoryId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Category category =
                categoryRepository.findByIdAndUserId(categoryId,userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        category.setActive(false);
        category.setUpdatedAt(LocalDateTime.now());

        categoryRepository.save(category);
    }
    
}