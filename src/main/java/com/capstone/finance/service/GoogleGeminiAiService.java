package com.capstone.finance.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class GoogleGeminiAiService {

    public static final String GEMINI_API_KEY = "Gemini_API_Key";

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAiFinancialAdvice(double deficitAmount, int deficitYear, double monthlyIncome, double monthlyExpenses, double monthlySavings) {
        if (GEMINI_API_KEY != null && !GEMINI_API_KEY.equals("AQ.Ab8RN6J2RyRRl1sFoRj1KxS4q9yPfVufsG7KOansYKDf1iSjCA") && !GEMINI_API_KEY.trim().isEmpty()) {
            try {
                return callGoogleGeminiApi(deficitAmount, deficitYear, monthlyIncome, monthlyExpenses, monthlySavings);
            } catch (Exception e) {
                System.err.println("Gemini API call failed, using intelligent rule engine fallback: " + e.getMessage());
            }
        }

        double requiredSalaryIncrease = Math.round((deficitAmount / 12) + (monthlyExpenses * 0.2));
        double requiredSavingsBoost = Math.round(deficitAmount / Math.max(1, deficitYear * 12));

        return String.format(
            "<strong>Deficit Warning in Year %d!</strong> Your projected balance drops into a negative deficit of %s. " +
            "<strong>Action Recommendations:</strong> Consider increasing your monthly salary by at least %s, or boosting your monthly savings by %s prior to Year %d to keep your timeline positive.",
            deficitYear, formatInr(deficitAmount), formatInr(requiredSalaryIncrease), formatInr(requiredSavingsBoost), deficitYear
        );
    }

    private String callGoogleGeminiApi(double deficitAmount, int deficitYear, double monthlyIncome, double monthlyExpenses, double monthlySavings) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

        String promptText = String.format(
            "Act as a professional financial planner. The user has a financial deficit of %s in Year %d of their project plan. " +
            "Current Monthly Income: %s, Current Monthly Expenses: %s, Monthly Savings: %s. " +
            "Provide a 2-sentence actionable advice suggesting whether to increase salary, cut expenses, or boost monthly savings.",
            formatInr(deficitAmount), deficitYear, formatInr(monthlyIncome), formatInr(monthlyExpenses), formatInr(monthlySavings)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> contents = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(contents));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            List candidates = (List) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                List parts = (List) content.get("parts");
                Map part = (Map) parts.get(0);
                return (String) part.get("text");
            }
        }
        throw new RuntimeException("Invalid Gemini API response structure");
    }

    private String formatInr(double amount) {
        amount = Math.abs(amount);
        if (amount >= 10000000) {
            return String.format("₹%.2f Crore", amount / 10000000.0);
        } else if (amount >= 100000) {
            return String.format("₹%.2f Lakh", amount / 100000.0);
        } else {
            return String.format("₹%,.0f", amount);
        }
    }
}
