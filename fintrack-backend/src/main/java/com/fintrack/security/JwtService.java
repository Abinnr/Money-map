package com.fintrack.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String DEV_DEFAULT_SECRET =
            "fintrack-super-secret-key-for-development-only-123456789";
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration,
            Environment environment) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be configured.");
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 bytes (256 bits) for HMAC-SHA256."
            );
        }

        if (environment.acceptsProfiles(Profiles.of("prod"))
                && DEV_DEFAULT_SECRET.equals(secret)) {
            throw new IllegalStateException(
                    "Default development JWT_SECRET cannot be used when 'prod' profile is active."
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
    }

    public String generateToken(Long userId) {
        return generateToken(userId, null, null);
    }

    public String generateToken(Long userId, String name, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        var builder = Jwts.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiryDate);

        if (name != null) {
            builder.claim("name", name);
        }
        if (email != null) {
            builder.claim("email", email);
        }

        return builder.signWith(secretKey).compact();
    }

    public Long extractUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();

        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("JWT subject is missing");
        }

        return Long.valueOf(subject);
    }
}