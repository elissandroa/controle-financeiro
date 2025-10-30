package com.elissandro.financeiro.config.customGrant;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

public class CustomUserAuthorities {

	private String userName;
	private Collection<? extends GrantedAuthority> authorities;

	public CustomUserAuthorities(String userName, Collection<? extends GrantedAuthority> authorities) {
		this.userName = userName;
		this.authorities = authorities;
	}

	public String getUserName() {
		return userName;
	}

	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}
}
