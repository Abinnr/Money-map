package com.fintrack.controller;

import com.fintrack.dto.CategoryResponse;
import com.fintrack.dto.CreateCategoryRequest;
import com.fintrack.entity.Category;
import com.fintrack.service.CategoryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(
            CategoryService categoryService) {

        this.categoryService = categoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {

        return categoryService.createCategory(request);
    }

    @GetMapping
    public List<CategoryResponse> getAvailableCategories() {

        return categoryService.getAvailableCategories();
    }

    @GetMapping("/{id}")
    public CategoryResponse getMyCategory(
            @PathVariable Long id) {

        return categoryService.getMyCategory(id);
    }
}