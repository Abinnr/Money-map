package com.fintrack.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.entity.User;
import com.fintrack.exception.EmailAlreadyExistsException;
import com.fintrack.exception.InvalidCredentialsException;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtService;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user.setPassword(hashedPassword);

        userRepository.save(user);
    }

    public String login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() ->
                    new InvalidCredentialsException(
                            "Invalid email or password"
                    )
            );

    if (!passwordEncoder.matches(
            request.getPassword(),
            user.getPassword())) {

        throw new InvalidCredentialsException(
                "Invalid email or password"
        );
    }
    return jwtService.generateToken(user.getId());
    }
}