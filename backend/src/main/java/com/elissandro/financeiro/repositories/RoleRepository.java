package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.Role;

public interface RoleRepository extends JpaRepository<Role, Long> { 

}
