package com.fintrack.dto;

import java.util.List;

public class TransactionPageResponse {

    private List<TransactionResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public TransactionPageResponse() {
    }

    public TransactionPageResponse(
            List<TransactionResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages) {

        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<TransactionResponse> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}