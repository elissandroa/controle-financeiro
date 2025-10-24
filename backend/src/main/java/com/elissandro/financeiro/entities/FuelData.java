package com.elissandro.financeiro.entities;

import java.io.Serializable;

import jakarta.persistence.Entity;

@Entity
public class FuelData extends Transaction implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private Double liters;
	private Double kilometers;
	private Double consumption;

	public FuelData() {
		super();
	}

	public FuelData(Long id, Double amount, String description, java.time.LocalDate date, String fuelType,
			Double liters, Double kilometers, Double consumption) {
		super(id, amount, description, date, null);
		this.liters = liters;
		this.kilometers = kilometers;
		this.consumption = consumption;
	}

	public Double getLiters() {
		return liters;
	}

	public void setLiters(Double liters) {
		this.liters = liters;
	}

	public Double getKilometers() {
		return kilometers;
	}

	public void setKilometers(Double kilometers) {
		this.kilometers = kilometers;
	}

	public Double getConsumption() {
		return consumption;
	}

	public Double calculateConsumption() {
		if (liters != null && liters > 0 && kilometers != null) {
			this.consumption = kilometers / liters;
		} else {
			this.consumption = null;
		}
		return this.consumption;
	}

}
