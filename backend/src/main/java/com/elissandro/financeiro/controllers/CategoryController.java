package com.elissandro.financeiro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elissandro.financeiro.dto.CategoryDTO;
import com.elissandro.financeiro.services.CategoryService;

@RestController
@RequestMapping("/categories")
public class CategoryController {
	
	@Autowired
	private CategoryService service;
	
	@GetMapping("/{id}")
	public CategoryDTO findById(@PathVariable Long id) {
		return service.findById(id);
	}
	
	@GetMapping
	public List<CategoryDTO> findAll() {
		return service.findAll();
	}
	
	@PostMapping
	public CategoryDTO createCategory(@RequestBody CategoryDTO categoryDTO) {
		return service.save(categoryDTO);
	}
	
	@PutMapping("/{id}")
	public CategoryDTO updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
		return service.update(id, categoryDTO);
	}
	
	@DeleteMapping("/{id}")
	public void deleteCategory(@PathVariable Long id) {
		service.delete(id);
	}
}
