package com.yebitir.repository;

import com.yebitir.model.Comment;
import com.yebitir.model.User;
import com.yebitir.model.UserCommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCommentReactionRepository extends JpaRepository<UserCommentReaction, Long> {
    Optional<UserCommentReaction> findByUserAndComment(User user, Comment comment);

    List<UserCommentReaction> findByUserAndCommentIn(User user, List<Comment> comments);

    @Query("SELECT ucr FROM UserCommentReaction ucr WHERE ucr.user.id = :userId AND ucr.comment.recipe.id = :recipeId")
    List<UserCommentReaction> findByUserIdAndRecipeId(@Param("userId") Long userId, @Param("recipeId") Long recipeId);
}