package com.fintrack.repository.projection;

import java.math.BigDecimal;

public interface CategoryExpenseSummary {

    Long getCategoryId();

    String getCategoryName();

    BigDecimal getAmount();
}