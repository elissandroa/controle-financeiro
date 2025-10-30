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

import com.elissandro.financeiro.dto.MemberDTO;
import com.elissandro.financeiro.services.MemberService;

@RestController
@RequestMapping("/members")
public class MemberController {

	@Autowired
	private MemberService service;
	
	@GetMapping
	public List<MemberDTO> findAll() {
		return service.findAll();
	}
	
	@PostMapping
	public MemberDTO createMember(@RequestBody MemberDTO memberDTO) {
		return service.save(memberDTO);
	}
	
	@PutMapping("/{id}")
	public MemberDTO updateMember(@PathVariable Long id, @RequestBody MemberDTO memberDTO) {
		return service.update(id, memberDTO);
	}
	
	@DeleteMapping("/{id}")
	public void deleteMember(@PathVariable Long id) {
		service.delete(id);
	}
}
