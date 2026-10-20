package com.capstone.finance.model;

public class FinancialProfile {

    private int currentAge;
    private int retirementAge;
    private double currentSavings;
    private double monthlyIncome;
    private double monthlyExpenses;
    private double monthlyInvestment;

    public FinancialProfile() {
    }

    public FinancialProfile(int currentAge, int retirementAge, double currentSavings, 
                            double monthlyIncome, double monthlyExpenses, double monthlyInvestment) {
        this.currentAge = currentAge;
        this.retirementAge = retirementAge;
        this.currentSavings = currentSavings;
        this.monthlyIncome = monthlyIncome;
        this.monthlyExpenses = monthlyExpenses;
        this.monthlyInvestment = monthlyInvestment;
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
}
