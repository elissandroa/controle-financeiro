package com.elissandro.financeiro.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.CategoryDTO;
import com.elissandro.financeiro.entities.Category;
import com.elissandro.financeiro.repositories.CategoryRepository;

@Service
public class CategoryService {
	
	@Autowired
	private CategoryRepository repository;
	
	@Transactional(readOnly = true)
	public List<CategoryDTO> findAll() {
		List<Category> categories = repository.findAll();
		return categories.stream().map(cat -> new CategoryDTO(cat)).toList();
	}
	
	@Transactional(readOnly = true)
	public CategoryDTO findById(Long id) {
		Category category = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found"));
		return new CategoryDTO(category);
	}
	
	public CategoryDTO save(CategoryDTO category) {
		Category newCategory = new Category();
		newCategory.setName(category.getName());
		newCategory = repository.save(newCategory);
		return new CategoryDTO(newCategory);
	}
	
	public CategoryDTO update(Long id, CategoryDTO categoryDetails) {
		Category category = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found"));
		
		category.setName(categoryDetails.getName());
		category = repository.save(category);
		return categoryDetails;
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new RuntimeException("Category not found");
		}
		repository.deleteById(id);
	}

}
