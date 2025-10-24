package com.elissandro.financeiro.dto;

import java.io.Serializable;

import com.elissandro.financeiro.entities.FuelData;

public class FuelDataDTO extends TransactionDTO  implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private Double liters;
	private Double kilometers;
	private Double consumption;
	
	public FuelDataDTO() {
		super();
	}
	
	public FuelDataDTO(long id, Double liters, Double kilometers, Double consumption) {
		super();
		this.liters = liters;
		this.kilometers = kilometers;
		this.consumption = consumption;
	}
	
	public FuelDataDTO(FuelData entity) {
		super(entity);
		this.liters = entity.getLiters();
		this.kilometers = entity.getKilometers();
		this.consumption = entity.getConsumption();
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

	public void setConsumption(Double consumption) {
		this.consumption = consumption;
	}
}
