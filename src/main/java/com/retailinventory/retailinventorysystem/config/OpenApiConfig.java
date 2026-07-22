package com.retailinventory.retailinventorysystem.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Retail Inventory Management System API")
                        .version("1.0.0")
                        .description("Backend API for managing a stationery shop's inventory — " +
                                "products, categories, suppliers, purchases, sales, and reporting. " +
                                "Secured with JWT authentication.")
                        .contact(new Contact()
                                .name("Adarsh Dixit")
                                .url("https://github.com/adarshhdixit/retail-inventory-management-system")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the token returned from /api/auth/login (without 'Bearer ' prefix)")))
                .tags(List.of(
                        new Tag().name("1. Authentication").description("Login to obtain a JWT token"),
                        new Tag().name("2. Dashboard").description("Aggregate statistics across the whole system"),
                        new Tag().name("3. Categories").description("Manage product categories"),
                        new Tag().name("4. Products").description("Manage product inventory, stock levels, search, and filtering"),
                        new Tag().name("5. Purchases").description("Record inventory purchases from suppliers"),
                        new Tag().name("6. Sales").description("Record sales, view revenue and top-selling product analytics"),
                        new Tag().name("7. Suppliers").description("Manage suppliers who provide inventory")
                ));
    }
}