package com.example.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is mandatory")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    // Bidirectional relationship mapping to handle cascade delete
    @OneToMany(mappedBy = "category", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore // Ensures the output JSON matches the flat Category JSON Schema
    private List<Task> tasks = new ArrayList<>();
}
