package com.elissandro.financeiro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elissandro.financeiro.entities.Member;

public interface MemberRepository extends JpaRepository<Member, Long> { 

}
