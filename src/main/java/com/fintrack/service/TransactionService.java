package com.fintrack.service;

import com.fintrack.dto.CreateTransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.dto.UpdateTransactionRequest;
import com.fintrack.entity.Category;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.CategoryType;
import com.fintrack.entity.TransactionType;
import com.fintrack.entity.User;
import com.fintrack.exception.InvalidCategoryException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.SecurityUtil;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {

        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public TransactionResponse createTransaction(
            CreateTransactionRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Category category =
                categoryRepository.findById(
                        request.getCategoryId()
                )
                .orElseThrow(() ->
                        new InvalidCategoryException(
                                "Category not found"
                        )
                );

        validateCategory(category, userId, request.getType());

        Transaction transaction = new Transaction();

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(
                request.getTransactionDate()
        );

        transaction.setUser(user);
        transaction.setCategory(category);

        LocalDateTime now = LocalDateTime.now();

        transaction.setCreatedAt(now);
        transaction.setUpdatedAt(now);

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return toResponse(savedTransaction);
    }

    public List<TransactionResponse> getMyTransactions() {

        Long userId = SecurityUtil.getCurrentUserId();

        return transactionRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TransactionResponse getMyTransaction(
            Long transactionId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Transaction transaction =
                transactionRepository
                        .findByIdAndUserId(
                                transactionId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Transaction not found"
                                )
                        );

        return toResponse(transaction);
    }


        public TransactionResponse updateTransaction(
                Long transactionId,
                UpdateTransactionRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        Transaction transaction =
                transactionRepository
                        .findByIdAndUserId(
                                transactionId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Transaction not found"
                                )
                        );

        Category category =
                categoryRepository
                        .findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new InvalidCategoryException(
                                        "Category not found"
                                )
                        );

        validateCategory(
                category,
                userId,
                request.getType()
        );

        transaction.setAmount(request.getAmount());

        transaction.setType(request.getType());

        transaction.setDescription(
                request.getDescription()
        );

        transaction.setTransactionDate(
                request.getTransactionDate()
        );

        transaction.setCategory(category);

        transaction.setUpdatedAt(
                LocalDateTime.now()
        );

        Transaction updatedTransaction =
                transactionRepository.save(transaction);

        return toResponse(updatedTransaction);
        }


        //validate category
        private void validateCategory(
                Category category,
                Long userId,
                TransactionType transactionType) {

                if (!category.isActive()) {
                throw new InvalidCategoryException(
                        "Category is inactive"
                );
                }

                boolean isSystemCategory =
                        category.getUser() == null;

                boolean belongsToUser =
                        category.getUser() != null
                                && category.getUser()
                                .getId()
                                .equals(userId);

                if (!isSystemCategory && !belongsToUser) {
                throw new InvalidCategoryException(
                        "Category is not available"
                );
                }

                if (!category.getType().name()
                .equals(transactionType.name())) {
                throw new InvalidCategoryException(
                        "Category type does not match transaction type"
                );
                }
        }

        private TransactionResponse toResponse(
                Transaction transaction) {

                return new TransactionResponse(
                        transaction.getId(),
                        transaction.getAmount(),
                        transaction.getType(),
                        transaction.getDescription(),
                        transaction.getTransactionDate(),
                        transaction.getCreatedAt(),
                        transaction.getUpdatedAt(),
                        transaction.getCategory().getId(),
                        transaction.getCategory().getName(),
                        transaction.getCategory().getType()
                );
        }
}