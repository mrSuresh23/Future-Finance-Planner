package com.capstone.finance.service;

import org.springframework.stereotype.Service;

@Service
public class TaxCalculatorService {

    public double calculateNewTax(double salary) {
        double taxable = Math.max(0, salary - 75000);
        double rawTax = 0;

        if (taxable <= 400000) {
            rawTax = 0;
        } else if (taxable <= 800000) {
            rawTax = (taxable - 400000) * 0.05;
        } else if (taxable <= 1200000) {
            rawTax = 20000 + (taxable - 800000) * 0.10;
        } else if (taxable <= 1600000) {
            rawTax = 60000 + (taxable - 1200000) * 0.15;
        } else if (taxable <= 2000000) {
            rawTax = 120000 + (taxable - 1600000) * 0.20;
        } else if (taxable <= 2400000) {
            rawTax = 200000 + (taxable - 2000000) * 0.25;
        } else {
            rawTax = 300000 + (taxable - 2400000) * 0.30;
        }

        double tax = rawTax;

        // Section 87A Rebate & Marginal Relief
        if (taxable <= 1200000) {
            tax = 0;
        } else {
            double excessIncome = taxable - 1200000;
            if (rawTax > excessIncome) {
                tax = excessIncome;
            }
        }

        // 4% Cess
        return Math.round(tax * 1.04);
    }

    /**
     * Calculates tax under Old Tax Regime for FY 2026–27
     * - Standard Deduction: ₹50,000
     * - Eligible deductions (80C capped at ₹1.5L + 80D)
     * - Tax Slabs:
     *   ₹0 – ₹2,50,000 : 0%
     *   ₹2,50,001 – ₹5,00,000 : 5%
     *   ₹5,00,001 – ₹10,00,000 : 20%
     *   Above ₹10,00,000 : 30%
     * - Section 87A rebate if taxable <= ₹5,00,000
     * - 4% Health & Education Cess
     */
    public double calculateOldTax(double salary) {
        return calculateOldTax(salary, 0, 0);
    }

    public double calculateOldTax(double salary, double deduction80C, double deduction80D) {
        double taxable = salary - 50000;
        taxable -= Math.min(deduction80C, 150000);
        taxable -= deduction80D;
        taxable = Math.max(0, taxable);

        double rawTax = 0;

        if (taxable <= 250000) {
            rawTax = 0;
        } else if (taxable <= 500000) {
            rawTax = (taxable - 250000) * 0.05;
        } else if (taxable <= 1000000) {
            rawTax = 12500 + (taxable - 500000) * 0.20;
        } else {
            rawTax = 112500 + (taxable - 1000000) * 0.30;
        }

        double tax = rawTax;
        if (taxable <= 500000) {
            tax = Math.max(0, rawTax - Math.min(rawTax, 12500));
        }

        return Math.round(tax * 1.04);
    }
}
