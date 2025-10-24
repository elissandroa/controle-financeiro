package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.FuelData;

public interface FuelDataRepository extends JpaRepository<FuelData, Long> { 

}
