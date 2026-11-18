package com.fintrack.repository.projection;

import java.math.BigDecimal;

public interface MonthlyTransactionSummary {

    Integer getYear();

    Integer getMonth();

    BigDecimal getIncome();

    BigDecimal getExpenses();
}