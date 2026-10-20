package com.capstone.finance.service;

import com.capstone.finance.model.CustomLifeEvent;
import com.capstone.finance.model.FinancialProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NarrativeService {

    private final GoogleGeminiAiService googleGeminiAiService;

    @Autowired
    public NarrativeService(GoogleGeminiAiService googleGeminiAiService) {
        this.googleGeminiAiService = googleGeminiAiService;
    }

    public String generateStory(FinancialProfile profile, List<CustomLifeEvent> customEvents, List<Double> timeline) {
        int deficitYear = -1;
        double maxDeficit = 0;

        for (int i = 0; i < timeline.size(); i++) {
            if (timeline.get(i) < 0) {
                if (deficitYear == -1) {
                    deficitYear = i;
                }
                double deficit = Math.abs(timeline.get(i));
                if (deficit > maxDeficit) {
                    maxDeficit = deficit;
                }
            }
        }

        if (deficitYear != -1) {
            return googleGeminiAiService.getAiFinancialAdvice(
                maxDeficit, deficitYear, profile.getMonthlyIncome(), profile.getMonthlyExpenses(), profile.getMonthlyInvestment()
            );
        }

        double finalWealth = timeline.get(timeline.size() - 1);
        String wealthFormatted = formatInr(finalWealth);
        String monthlySavingsFormatted = formatInr(profile.getMonthlyInvestment());
        String annualSavingsFormatted = formatInr(profile.getMonthlyInvestment() * 12);
        int years = profile.getRetirementAge() - profile.getCurrentAge();

        StringBuilder story = new StringBuilder();

        story.append("Starting with a current savings of ")
             .append(formatInr(profile.getCurrentSavings()))
             .append(" and saving ")
             .append(monthlySavingsFormatted)
             .append(" monthly (")
             .append(annualSavingsFormatted)
             .append(" per year), your total accumulated wealth is projected to reach ")
             .append(wealthFormatted)
             .append(" over ")
             .append(years)
             .append(" years by age ")
             .append(profile.getRetirementAge())
             .append(". ");

        if (customEvents != null && !customEvents.isEmpty()) {
            CustomLifeEvent event = customEvents.get(0);
            String durStr = event.getDuration();
            String durDesc = "lifetime";
            if (durStr != null && !"0".equals(durStr) && !"lifetime".equalsIgnoreCase(durStr)) {
                try {
                    int durVal = Integer.parseInt(durStr);
                    durDesc = (durVal == 1) ? "1 month" : durVal + " months";
                } catch (NumberFormatException e) {
                    durDesc = durStr;
                }
            }
            int eventMonth = event.getMonth() > 0 ? event.getMonth() : (event.getYear() > 0 ? event.getYear() * 12 : 1);
            boolean isPositive = "+".equals(event.getType()) || "salary_increase".equalsIgnoreCase(event.getType()) || "income_boost".equalsIgnoreCase(event.getType());

            String typeDesc = isPositive ? 
                ("financial boost of +" + formatInr(event.getAmount()) + "/month (" + durDesc + ") starting") :
                ("financial reduction of -" + formatInr(event.getAmount()) + "/month (" + durDesc + ") starting");

            story.append("This includes your ")
                 .append(event.getName())
                 .append(" (")
                 .append(typeDesc)
                 .append(" Month ")
                 .append(eventMonth)
                 .append(").");
        } else {
            story.append("Your direct annual savings plan provides a steady, transparent path toward your financial goals.");
        }

        return story.toString();
    }

    private String formatInr(double amount) {
        if (amount >= 10000000) {
            return String.format("₹%.2f Crore", amount / 10000000.0);
        } else if (amount >= 100000) {
            return String.format("₹%.2f Lakh", amount / 100000.0);
        } else {
            return String.format("₹%,.0f", amount);
        }
    }
}
