package com.fintrack.service;

import com.fintrack.dto.CreateTransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
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

        public TransactionService(
                TransactionRepository transactionRepository,
                UserRepository userRepository) {

        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        }


        private TransactionResponse toResponse(Transaction transaction) {

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getTransactionDate(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
        }

        public TransactionResponse createTransaction(
                CreateTransactionRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Transaction transaction = new Transaction();

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(
                request.getTransactionDate()
        );

        transaction.setUser(user);

        LocalDateTime now = LocalDateTime.now();

        transaction.setCreatedAt(now);
        transaction.setUpdatedAt(now);

        Transaction savedTransaction= transactionRepository.save(transaction);
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

        public TransactionResponse getMyTransaction(Long transactionId) {

        Long userId = SecurityUtil.getCurrentUserId();

        Transaction transaction= transactionRepository
                .findByIdAndUserId(transactionId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found"
                        )
                );
                return toResponse(transaction);
        }
}