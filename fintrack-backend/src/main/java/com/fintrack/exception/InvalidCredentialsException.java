package com.fintrack.exception;
public class InvalidCredentialsException extends RuntimeException{
    public InvalidCredentialsException(String message){
        super(message);
    }
}
