package com.elissandro.financeiro.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.MemberDTO;
import com.elissandro.financeiro.entities.Member;
import com.elissandro.financeiro.repositories.MemberRepository;

@Service
public class MemberService {

	@Autowired
	private MemberRepository repository;

	@Transactional(readOnly = true)
	public List<MemberDTO> findAll() {
		List<Member> members = repository.findAll();
		return members.stream().map(mem -> new MemberDTO(mem)).toList();
	}

	public MemberDTO save(MemberDTO member) {
		Member newMember = new Member();
		newMember.setName(member.getName());
		newMember.setRole(member.getRole());
		newMember.setCreatedAt(member.getCreatedAt() != null ? member.getCreatedAt() : LocalDate.now());
		newMember.getTransactions().clear();
		newMember.getTransactions().addAll(member.getTransactions());
		newMember = repository.save(newMember);
		return new MemberDTO(newMember);
	}

	
	public MemberDTO update(Long id, MemberDTO memberDetails) {
		Member member = repository.findById(id).orElseThrow(() -> new RuntimeException("Member not found"));

		member.setName(memberDetails.getName());
		member.setRole(memberDetails.getRole());
		member = repository.save(member);
		return memberDetails;
	}

	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new RuntimeException("Member not found");
		}
		repository.deleteById(id);
	}
}
