package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> { 

}
