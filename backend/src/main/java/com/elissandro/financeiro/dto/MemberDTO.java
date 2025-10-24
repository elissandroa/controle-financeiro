package com.elissandro.financeiro.dto;

import java.io.Serializable;
import java.time.LocalDate;

import com.elissandro.financeiro.entities.Member;

public class MemberDTO implements Serializable {
	private static final long serialVersionUID = 1L;

	private Long id;
	private String name;
	private String role;
	private LocalDate createdAt;
	
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
}
