package com.capstone.finance.service;

import com.capstone.finance.model.CustomLifeEvent;
import com.capstone.finance.model.FinancialProfile;
import com.capstone.finance.model.SimulationRequest;
import com.capstone.finance.model.SimulationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MonteCarloService {

    private final NarrativeService narrativeService;

    @Autowired
    public MonteCarloService(NarrativeService narrativeService) {
        this.narrativeService = narrativeService;
    }

    public SimulationResult runSimulation(SimulationRequest request) {
        FinancialProfile profile = request.getProfile();
        List<CustomLifeEvent> customEvents = request.getCustomEvents();

        int startAge = profile.getCurrentAge();
        int retirementAge = profile.getRetirementAge();
        int totalYears = Math.max(1, retirementAge - startAge);
        int totalMonths = totalYears * 12;

        double baseMonthlySavings = profile.getMonthlyInvestment();
        double accumulatedWealth = profile.getCurrentSavings();

        List<String> ageLabels = new ArrayList<>();
        List<Double> directWealthTimeline = new ArrayList<>();

        ageLabels.add("Age " + startAge);
        directWealthTimeline.add(accumulatedWealth);

        for (int m = 1; m <= totalMonths; m++) {
            double monthlySavingsForMonth = baseMonthlySavings;

            if (customEvents != null) {
                for (CustomLifeEvent event : customEvents) {
                    int startMonth = event.getMonth() > 0 ? event.getMonth() : (event.getYear() > 0 ? event.getYear() * 12 : 1);
                    int endMonth = totalMonths;
                    String durStr = event.getDuration();
                    if (durStr != null && !durStr.isEmpty() && !"lifetime".equalsIgnoreCase(durStr) && !"0".equals(durStr)) {
                        try {
                            int dur = Integer.parseInt(durStr);
                            if (dur > 0) {
                                endMonth = startMonth + dur - 1;
                            }
                        } catch (NumberFormatException nfe) {
                            endMonth = totalMonths;
                        }
                    }

                    if (m >= startMonth && m <= endMonth) {
                        String type = event.getType();
                        boolean isPositive = "+".equals(type) || "salary_increase".equalsIgnoreCase(type) || "income_boost".equalsIgnoreCase(type);
                        if (isPositive) {
                            monthlySavingsForMonth += event.getAmount();
                        } else {
                            monthlySavingsForMonth -= event.getAmount();
                        }
                    }
                }
            }

            accumulatedWealth += monthlySavingsForMonth;

            if (m % 12 == 0) {
                int currentYear = m / 12;
                ageLabels.add("Age " + (startAge + currentYear));
                directWealthTimeline.add(accumulatedWealth);
            }
        }

        double finalWealth = directWealthTimeline.get(directWealthTimeline.size() - 1);

        SimulationResult result = new SimulationResult();
        result.setAgeLabels(ageLabels);
        result.setExpected50th(directWealthTimeline);
        result.setOptimistic10th(directWealthTimeline);
        result.setPessimistic90th(directWealthTimeline);

        result.setSuccessRatePercent(100.0);
        result.setMedianRetirementWealth(finalWealth);
        result.setPessimisticFloorWealth(finalWealth);
        result.setRiskProfile("Direct Accumulation Model");

        String story = narrativeService.generateStory(profile, customEvents, directWealthTimeline);
        result.setAiNarrativeStory(story);

        return result;
    }
}
