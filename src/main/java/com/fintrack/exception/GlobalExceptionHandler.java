package com.fintrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleEmailAlreadyExists(
            EmailAlreadyExistsException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public String handleInvalidCredentials(InvalidCredentialsException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleResourceNotFound(ResourceNotFoundException exception) {

    return exception.getMessage();
    }

    @ExceptionHandler(CategoryAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleCategoryAlreadyExists(
            CategoryAlreadyExistsException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(SystemCategoryModificationException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleSystemCategoryModification(
            SystemCategoryModificationException exception) {

        return exception.getMessage();
    }

}