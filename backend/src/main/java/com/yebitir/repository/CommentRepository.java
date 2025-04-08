package com.yebitir.repository;

import com.yebitir.model.Comment;
import com.yebitir.model.Recipe;
import com.yebitir.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByRecipe(Recipe recipe);

    List<Comment> findByAuthor(User author);
}