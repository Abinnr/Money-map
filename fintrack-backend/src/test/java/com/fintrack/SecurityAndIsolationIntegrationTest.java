package com.fintrack;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.fintrack.entity.Category;
import com.fintrack.entity.CategoryType;
import com.fintrack.repository.CategoryRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAndIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Long systemExpenseCategoryId;

    @BeforeEach
    void ensureSystemCategory() {
        Category cat = new Category();
        cat.setName("Test-Food-" + UUID.randomUUID());
        cat.setType(CategoryType.EXPENSE);
        cat.setUser(null); // system category
        cat.setActive(true);
        cat.setCreatedAt(LocalDateTime.now());
        cat.setUpdatedAt(LocalDateTime.now());
        systemExpenseCategoryId = categoryRepository.save(cat).getId();
    }

    private String registerAndLogin(String email, String password) throws Exception {
        String registerPayload = objectMapper.writeValueAsString(Map.of(
                "name", "Test User",
                "email", email,
                "password", password
        ));

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Forwarded-For", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated());

        String loginPayload = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", password
        ));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        return loginResult.getResponse().getContentAsString();
    }

    @Test
    void shouldRejectUnauthenticatedAndExpiredOrTamperedTokensWith401() throws Exception {
        // 1. Missing token
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // 2. Tampered token
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());

        // 3. Expired token
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        String expiredToken = Jwts.builder()
                .subject("1")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000))
                .expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(key)
                .compact();

        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldEnforceAuthRateLimitAfterMaxAttempts() throws Exception {
        String clientIp = "10.0.0." + (int) (Math.random() * 200 + 1);
        String badLogin = objectMapper.writeValueAsString(Map.of(
                "email", "nobody@example.com",
                "password", "wrongpassword"
        ));

        // First 5 attempts fail with 401
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(badLogin))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt within window is blocked with 429
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badLogin))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    void shouldEnforceStrictUserIsolationAcrossTransactionsBudgetsAndCategories() throws Exception {
        String tokenA = registerAndLogin("usera_" + UUID.randomUUID() + "@test.com", "Password123!");
        String tokenB = registerAndLogin("userb_" + UUID.randomUUID() + "@test.com", "Password123!");

        // User A creates a transaction
        String txPayload = objectMapper.writeValueAsString(Map.of(
                "amount", 1250.50,
                "type", "EXPENSE",
                "description", "User A Private Expense",
                "transactionDate", "2026-11-15T10:30:00",
                "categoryId", systemExpenseCategoryId
        ));

        MvcResult txResult = mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(txPayload))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode createdTx = objectMapper.readTree(txResult.getResponse().getContentAsString());
        long txId = createdTx.get("id").asLong();

        // User B cannot read, update, or delete User A's transaction
        mockMvc.perform(get("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(txPayload))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // User A creates a budget
        String budgetPayload = objectMapper.writeValueAsString(Map.of(
                "amount", 5000.00,
                "month", 11,
                "year", 2026,
                "categoryId", systemExpenseCategoryId
        ));

        MvcResult budgetResult = mockMvc.perform(post("/api/budgets")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(budgetPayload))
                .andExpect(status().isCreated())
                .andReturn();

        long budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asLong();

        // User B cannot read or delete User A's budget
        mockMvc.perform(get("/api/budgets/" + budgetId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/budgets/" + budgetId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // User A creates a custom category
        String catPayload = objectMapper.writeValueAsString(Map.of(
                "name", "UserA-Custom-" + UUID.randomUUID(),
                "type", "EXPENSE"
        ));

        MvcResult catResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(catPayload))
                .andExpect(status().isCreated())
                .andReturn();

        long customCatId = objectMapper.readTree(catResult.getResponse().getContentAsString())
                .get("id").asLong();

        // User B cannot delete User A's custom category or attach a transaction to it
        mockMvc.perform(delete("/api/categories/" + customCatId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        String hijackTxPayload = objectMapper.writeValueAsString(Map.of(
                "amount", 100.00,
                "type", "EXPENSE",
                "description", "Cross-user category attempt",
                "transactionDate", "2026-11-15T10:30:00",
                "categoryId", customCatId
        ));

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hijackTxPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectOversizedDtoInputsWith400() throws Exception {
        String token = registerAndLogin("val_" + UUID.randomUUID() + "@test.com", "Password123!");
        String tooLongDescription = "x".repeat(300);

        String invalidTx = objectMapper.writeValueAsString(Map.of(
                "amount", 50.00,
                "type", "EXPENSE",
                "description", tooLongDescription,
                "transactionDate", "2026-11-15T10:30:00",
                "categoryId", systemExpenseCategoryId
        ));

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidTx))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.description").exists());
    }
}