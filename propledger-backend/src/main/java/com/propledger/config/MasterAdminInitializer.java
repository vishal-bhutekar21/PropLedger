package com.propledger.config;

import com.propledger.entity.Role;
import com.propledger.entity.User;
import com.propledger.repository.RoleRepository;
import com.propledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class MasterAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public static final String MASTER_EMAIL = "vishal.bhutekar1@gmail.com";
    public static final String MASTER_PASS = "Vishal@1233";

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking Master Administrator account provisions...");

        // Ensure roles exist
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_SUPER_ADMIN")
                        .description("Master Administrator with unrestricted platform access")
                        .build()));

        Role propManagerRole = roleRepository.findByName("ROLE_PROPERTY_MANAGER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_PROPERTY_MANAGER")
                        .description("Full property, lease, and tenant management")
                        .build()));

        Role accountantRole = roleRepository.findByName("ROLE_ACCOUNTANT")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_ACCOUNTANT")
                        .description("Financial subledger and reporting access")
                        .build()));

        Set<Role> masterRoles = new HashSet<>();
        masterRoles.add(superAdminRole);
        masterRoles.add(propManagerRole);
        masterRoles.add(accountantRole);

        User masterUser = userRepository.findByUsernameOrEmail(MASTER_EMAIL, MASTER_EMAIL)
                .orElse(null);

        if (masterUser == null) {
            masterUser = User.builder()
                    .username(MASTER_EMAIL)
                    .email(MASTER_EMAIL)
                    .fullName("Vishal Bhutekar (Master Administrator)")
                    .phone("+1-555-MASTER")
                    .passwordHash(passwordEncoder.encode(MASTER_PASS))
                    .isActive(true)
                    .roles(masterRoles)
                    .build();
            userRepository.save(masterUser);
            log.info("Successfully provisioned Master Administrator account: {}", MASTER_EMAIL);
        } else {
            masterUser.setPasswordHash(passwordEncoder.encode(MASTER_PASS));
            masterUser.setIsActive(true);
            masterUser.getRoles().addAll(masterRoles);
            userRepository.save(masterUser);
            log.info("Verified and updated Master Administrator credentials for: {}", MASTER_EMAIL);
        }
    }
}
