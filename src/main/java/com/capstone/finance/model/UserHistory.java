package com.capstone.finance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_history")
public class UserHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    private int currentAge;
    private int retirementAge;
    private double currentSavings;
    private double monthlyIncome;
    private double monthlyExpenses;
    private double monthlyInvestment;
    private double targetGoalAmount;
    private int targetGoalYears;

    @Column(columnDefinition = "TEXT")
    private String customEventsJson;

    private LocalDateTime createdAt;

    // public UserHistory() {
    // }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getCurrentAge() {
        return currentAge;
    }

    public void setCurrentAge(int currentAge) {
        this.currentAge = currentAge;
    }

    public int getRetirementAge() {
        return retirementAge;
    }

    public void setRetirementAge(int retirementAge) {
        this.retirementAge = retirementAge;
    }

    public double getCurrentSavings() {
        return currentSavings;
    }

    public void setCurrentSavings(double currentSavings) {
        this.currentSavings = currentSavings;
    }

    public double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public double getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(double monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    public double getMonthlyInvestment() {
        return monthlyInvestment;
    }

    public void setMonthlyInvestment(double monthlyInvestment) {
        this.monthlyInvestment = monthlyInvestment;
    }

    public double getTargetGoalAmount() {
        return targetGoalAmount;
    }

    public void setTargetGoalAmount(double targetGoalAmount) {
        this.targetGoalAmount = targetGoalAmount;
    }

    public int getTargetGoalYears() {
        return targetGoalYears;
    }

    public void setTargetGoalYears(int targetGoalYears) {
        this.targetGoalYears = targetGoalYears;
    }

    public String getCustomEventsJson() {
        return customEventsJson;
    }

    public void setCustomEventsJson(String customEventsJson) {
        this.customEventsJson = customEventsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
