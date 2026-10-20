package com.capstone.finance.model;

public class CustomLifeEvent {

    private long id;
    private String name;
    private int year;
    private int month;
    private String duration;
    private double amount;
    private String type;

    public CustomLifeEvent() {
    }

    public CustomLifeEvent(long id, String name, int year, int month, String duration, double amount, String type) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.month = month;
        this.duration = duration;
        this.amount = amount;
        this.type = type;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
