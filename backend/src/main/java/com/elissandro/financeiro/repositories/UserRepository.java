package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.User;

public interface UserRepository extends JpaRepository<User, Long> { 

}
