package com.capstone.finance.model;

import java.util.List;

public class SimulationRequest {

    private FinancialProfile profile;
    private List<CustomLifeEvent> customEvents;

    public SimulationRequest() {
    }

    public SimulationRequest(FinancialProfile profile, List<CustomLifeEvent> customEvents) {
        this.profile = profile;
        this.customEvents = customEvents;
    }

    public FinancialProfile getProfile() {
        return profile;
    }

    public void setProfile(FinancialProfile profile) {
        this.profile = profile;
    }

    public List<CustomLifeEvent> getCustomEvents() {
        return customEvents;
    }

    public void setCustomEvents(List<CustomLifeEvent> customEvents) {
        this.customEvents = customEvents;
    }
}
