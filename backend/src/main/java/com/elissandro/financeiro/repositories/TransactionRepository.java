package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> { 

}
