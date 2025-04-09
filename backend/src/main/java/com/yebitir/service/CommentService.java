package com.yebitir.service;

import com.yebitir.dto.CommentDTO;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UnauthorizedException;
import com.yebitir.model.Comment;
import com.yebitir.model.Recipe;
import com.yebitir.model.Role;
import com.yebitir.model.User;
import com.yebitir.model.UserCommentReaction;
import com.yebitir.repository.CommentRepository;
import com.yebitir.repository.RecipeRepository;
import com.yebitir.repository.UserCommentReactionRepository;
import com.yebitir.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CommentService {
    private final CommentRepository commentRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserCommentReactionRepository userCommentReactionRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, RecipeRepository recipeRepository,
            UserRepository userRepository, UserCommentReactionRepository userCommentReactionRepository) {
        this.commentRepository = commentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.userCommentReactionRepository = userCommentReactionRepository;
    }

    @Transactional
    public Comment addComment(Long recipeId, Long userId, String text) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Comment comment = new Comment();
        comment.setAuthor(user);
        comment.setRecipe(recipe);
        comment.setText(text);
        comment.setTime(LocalDateTime.now());
        comment.setLikes(0);
        comment.setDislikes(0);

        return commentRepository.save(comment);
    }

    @Transactional
    public Comment updateComment(Long commentId, Long userId, String text) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only the author or an admin can update a comment
        if (!comment.getAuthor().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to update this comment");
        }

        comment.setText(text);

        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByRecipe(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        return commentRepository.findByRecipeWithAuthor(recipe);
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByRecipeWithUserReactions(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        List<Comment> comments = commentRepository.findByRecipeWithAuthor(recipe);

        if (userId == null) {
            // If user is not logged in, return comments without reaction info
            return comments.stream()
                    .map(CommentDTO::new)
                    .collect(Collectors.toList());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<UserCommentReaction> reactions = userCommentReactionRepository.findByUserAndCommentIn(user, comments);

        // Map comments to their reactions for efficient lookup
        Map<Long, UserCommentReaction> commentReactionsMap = reactions.stream()
                .collect(Collectors.toMap(
                        reaction -> reaction.getComment().getId(),
                        Function.identity()));

        // Create DTOs with reaction info
        return comments.stream()
                .map(comment -> {
                    UserCommentReaction reaction = commentReactionsMap.get(comment.getId());
                    return new CommentDTO(comment, reaction);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only the author, recipe owner, or an admin can delete a comment
        if (!comment.getAuthor().getId().equals(userId) &&
                !comment.getRecipe().getOwner().getId().equals(userId) &&
                user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public Comment likeComment(Long commentId, Long userId) {
        log.info("Attempting to like comment: commentId={}, userId={}", commentId, userId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        log.info("Found comment: id={}, current likes={}, dislikes={}", comment.getId(), comment.getLikes(),
                comment.getDislikes());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        log.info("Found user: id={}, username={}", user.getId(), user.getUsername());

        Optional<UserCommentReaction> existingReaction = userCommentReactionRepository.findByUserAndComment(user,
                comment);
        log.info("Existing reaction found: {}", existingReaction.isPresent());

        if (existingReaction.isPresent()) {
            UserCommentReaction reaction = existingReaction.get();
            log.info("Existing reaction type: {}", reaction.getReactionType());

            if (reaction.getReactionType() == UserCommentReaction.ReactionType.LIKE) {
                // User already liked this comment, remove the like
                log.info("Removing existing LIKE reaction");
                userCommentReactionRepository.delete(reaction);
                comment.setLikes(comment.getLikes() - 1);
                log.info("Updated comment likes to: {}", comment.getLikes());
            } else {
                // User previously disliked this comment, change to like
                log.info("Changing DISLIKE reaction to LIKE");
                reaction.setReactionType(UserCommentReaction.ReactionType.LIKE);
                UserCommentReaction savedReaction = userCommentReactionRepository.save(reaction);
                log.info("Saved reaction with id: {}, type: {}", savedReaction.getId(),
                        savedReaction.getReactionType());

                comment.setLikes(comment.getLikes() + 1);
                comment.setDislikes(comment.getDislikes() - 1);
                log.info("Updated comment likes to: {}, dislikes to: {}", comment.getLikes(), comment.getDislikes());
            }
        } else {
            // New like
            log.info("Creating new LIKE reaction");
            UserCommentReaction reaction = new UserCommentReaction();
            reaction.setUser(user);
            reaction.setComment(comment);
            reaction.setReactionType(UserCommentReaction.ReactionType.LIKE);
            UserCommentReaction savedReaction = userCommentReactionRepository.save(reaction);
            log.info("Saved new reaction with id: {}", savedReaction.getId());

            comment.setLikes(comment.getLikes() + 1);
            log.info("Updated comment likes to: {}", comment.getLikes());
        }

        Comment savedComment = commentRepository.save(comment);
        log.info("Saved comment with id: {}, likes: {}, dislikes: {}",
                savedComment.getId(), savedComment.getLikes(), savedComment.getDislikes());

        return savedComment;
    }

    @Transactional
    public Comment dislikeComment(Long commentId, Long userId) {
        log.info("Attempting to dislike comment: commentId={}, userId={}", commentId, userId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        log.info("Found comment: id={}, current likes={}, dislikes={}", comment.getId(), comment.getLikes(),
                comment.getDislikes());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        log.info("Found user: id={}, username={}", user.getId(), user.getUsername());

        Optional<UserCommentReaction> existingReaction = userCommentReactionRepository.findByUserAndComment(user,
                comment);
        log.info("Existing reaction found: {}", existingReaction.isPresent());

        if (existingReaction.isPresent()) {
            UserCommentReaction reaction = existingReaction.get();
            log.info("Existing reaction type: {}", reaction.getReactionType());

            if (reaction.getReactionType() == UserCommentReaction.ReactionType.DISLIKE) {
                // User already disliked this comment, remove the dislike
                log.info("Removing existing DISLIKE reaction");
                userCommentReactionRepository.delete(reaction);
                comment.setDislikes(comment.getDislikes() - 1);
                log.info("Updated comment dislikes to: {}", comment.getDislikes());
            } else {
                // User previously liked this comment, change to dislike
                log.info("Changing LIKE reaction to DISLIKE");
                reaction.setReactionType(UserCommentReaction.ReactionType.DISLIKE);
                UserCommentReaction savedReaction = userCommentReactionRepository.save(reaction);
                log.info("Saved reaction with id: {}, type: {}", savedReaction.getId(),
                        savedReaction.getReactionType());

                comment.setDislikes(comment.getDislikes() + 1);
                comment.setLikes(comment.getLikes() - 1);
                log.info("Updated comment likes to: {}, dislikes to: {}", comment.getLikes(), comment.getDislikes());
            }
        } else {
            // New dislike
            log.info("Creating new DISLIKE reaction");
            UserCommentReaction reaction = new UserCommentReaction();
            reaction.setUser(user);
            reaction.setComment(comment);
            reaction.setReactionType(UserCommentReaction.ReactionType.DISLIKE);
            UserCommentReaction savedReaction = userCommentReactionRepository.save(reaction);
            log.info("Saved new reaction with id: {}", savedReaction.getId());

            comment.setDislikes(comment.getDislikes() + 1);
            log.info("Updated comment dislikes to: {}", comment.getDislikes());
        }

        Comment savedComment = commentRepository.save(comment);
        log.info("Saved comment with id: {}, likes: {}, dislikes: {}",
                savedComment.getId(), savedComment.getLikes(), savedComment.getDislikes());

        return savedComment;
    }
}