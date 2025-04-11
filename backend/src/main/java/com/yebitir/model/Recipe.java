package com.yebitir.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "owner", "savedByUsers", "comments" })
@EqualsAndHashCode(exclude = { "owner", "savedByUsers", "comments" })
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image", columnDefinition = "LONGBLOB")
    private byte[] image;

    @Column(name = "time_in_mins")
    private Integer timeInMins;

    private Float rating;

    private Integer servings;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "date_created")
    private LocalDateTime dateCreated;

    private String cuisine;

    @Column(name = "meal_type")
    private String mealType;

    private String diet;

    @Column(name = "main_ingredient")
    private String mainIngredient;

    @Column(name = "prep_time")
    private Integer prepTime;

    @Column(name = "cook_time")
    private Integer cookTime;

    @Column(name = "is_active", nullable = false)
    private Boolean active = false;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "ingredient", columnDefinition = "TEXT")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<String> ingredients = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "recipe_instructions", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "instruction", columnDefinition = "TEXT")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<String> instructions = new ArrayList<>();

    @ManyToMany(mappedBy = "savedRecipes")
    private Set<User> savedByUsers = new HashSet<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
}