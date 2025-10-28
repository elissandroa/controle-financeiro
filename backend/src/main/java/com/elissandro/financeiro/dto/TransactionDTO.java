package com.elissandro.financeiro.dto;

import java.io.Serializable;
import java.time.LocalDate;

import com.elissandro.financeiro.entities.Transaction;
import com.elissandro.financeiro.entities.TransactionType;

public class TransactionDTO implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private Long id;
	private Double amount;
	private String description;
	private LocalDate date;
	private TransactionType transactionType;
	
	private MemberDTO member;
	private Long memberId;
	
	private CategoryDTO category;
	
	public TransactionDTO() {
	}
	
	public TransactionDTO(Long id, Double amount, String description, LocalDate date, MemberDTO member, CategoryDTO category, TransactionType transactionType) {
		this.id = id;
		this.amount = amount;
		this.description = description;
		this.date = date;
		this.member = member;
		this.category = category;
		this.transactionType = transactionType;
	}
	
	public TransactionDTO(Transaction entity) {
		this.id = entity.getId();
		this.amount = entity.getAmount();
		this.description = entity.getDescription();
		this.date = entity.getDate();
		this.transactionType = entity.getTransactionType();
		this.member = new MemberDTO(entity.getMember());
		this.category = new CategoryDTO(entity.getCategory());
		this.memberId = entity.getMember().getId();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public MemberDTO getMember() {
		return member;
	}

	public void setMember(MemberDTO member) {
		this.member = member;
	}

	public CategoryDTO getCategory() {
		return category;
	}

	public void setCategory(CategoryDTO category) {
		this.category = category;
	}

	public Long getMemberId() {
		return memberId;
	}

	public void setMemberId(Long memberId) {
		this.memberId = memberId;
	}

	public TransactionType getTransactionType() {
		return transactionType;
	}

	public void setTransactionType(TransactionType transactionType) {
		this.transactionType = transactionType;
	}


}
