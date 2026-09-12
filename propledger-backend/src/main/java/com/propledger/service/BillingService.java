package com.propledger.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface BillingService {
    Map<String, Object> generateMonthlyInvoices(LocalDate billingDate, String generatedBy);
    Map<String, Object> assessLateFees(LocalDate asOfDate, BigDecimal lateFeeAmount, String assessedBy);
}
