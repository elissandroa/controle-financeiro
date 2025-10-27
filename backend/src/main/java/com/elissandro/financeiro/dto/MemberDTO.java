package com.elissandro.financeiro.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.elissandro.financeiro.entities.Member;
import com.elissandro.financeiro.entities.Transaction;

public class MemberDTO implements Serializable {
	private static final long serialVersionUID = 1L;

	private Long id;
	private String name;
	private String role;
	private LocalDate createdAt;
	
	private List<Transaction> transactions = new ArrayList<>();
	
	public MemberDTO() {
	}
	
	public MemberDTO(Long id, String name, String role, LocalDate createdAt) {
		this.id = id;
		this.name = name;
		this.role = role;
		this.createdAt = createdAt;
	}
	
	public MemberDTO(Member entity) {
		this.id = entity.getId();
		this.name = entity.getName();
		this.role = entity.getRole();
		this.createdAt = entity.getCreatedAt();
		this.transactions = entity.getTransactions();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public LocalDate getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDate createdAt) {
		this.createdAt = createdAt;
	}

	public List<Transaction> getTransactions() {
		return transactions;
	}
}
