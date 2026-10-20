package com.capstone.finance.model;

import java.util.List;
import java.util.Map;

public class SimulationResult {

    private List<String> ageLabels;
    private List<Double> optimistic10th;
    private List<Double> expected50th;
    private List<Double> pessimistic90th;

    private double successRatePercent;
    private double medianRetirementWealth;
    private double pessimisticFloorWealth;
    private String riskProfile;

    private String aiNarrativeStory;

    public SimulationResult() {
    }

    public List<String> getAgeLabels() {
        return ageLabels;
    }

    public void setAgeLabels(List<String> ageLabels) {
        this.ageLabels = ageLabels;
    }

    public List<Double> getOptimistic10th() {
        return optimistic10th;
    }

    public void setOptimistic10th(List<Double> optimistic10th) {
        this.optimistic10th = optimistic10th;
    }

    public List<Double> getExpected50th() {
        return expected50th;
    }

    public void setExpected50th(List<Double> expected50th) {
        this.expected50th = expected50th;
    }

    public List<Double> getPessimistic90th() {
        return pessimistic90th;
    }

    public void setPessimistic90th(List<Double> pessimistic90th) {
        this.pessimistic90th = pessimistic90th;
    }

    public double getSuccessRatePercent() {
        return successRatePercent;
    }

    public void setSuccessRatePercent(double successRatePercent) {
        this.successRatePercent = successRatePercent;
    }

    public double getMedianRetirementWealth() {
        return medianRetirementWealth;
    }

    public void setMedianRetirementWealth(double medianRetirementWealth) {
        this.medianRetirementWealth = medianRetirementWealth;
    }

    public double getPessimisticFloorWealth() {
        return pessimisticFloorWealth;
    }

    public void setPessimisticFloorWealth(double pessimisticFloorWealth) {
        this.pessimisticFloorWealth = pessimisticFloorWealth;
    }

    public String getRiskProfile() {
        return riskProfile;
    }

    public void setRiskProfile(String riskProfile) {
        this.riskProfile = riskProfile;
    }

    public String getAiNarrativeStory() {
        return aiNarrativeStory;
    }

    public void setAiNarrativeStory(String aiNarrativeStory) {
        this.aiNarrativeStory = aiNarrativeStory;
    }
}
