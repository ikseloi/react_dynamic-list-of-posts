import React, { useEffect, useState } from 'react';

import { Loader } from '../Loader';
import { NewCommentForm } from './NewCommentForm';
import { Notification } from '../Notification';

import { ErrorType } from '../../Enums/Error';
import { Post } from '../../types/Post';
import { Comment, CommentData } from '../../types/Comment';

// import {
//   addComment,
//   deleteComment,
//   getCommentsByPost,
// } from '../../api/comments';

import { client } from '../../utils/fetchClient';

import {
  optimisticDeleteComment,
  restoreComment,
} from '../../utils/optimisticDeleteComment';

type Props = { post: Post };

export const PostDetails: React.FC<Props> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoadError, setCommentsLoadError] = useState('');
  const [commentAddError, setCommentAddError] = useState('');
  const [commentDeleteError, setCommentDeleteError] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);

  useEffect(() => {
    setCommentsLoadError('');
    setCommentAddError('');
    setCommentDeleteError('');
    setComments([]);
    setIsCommentFormVisible(false);
    setIsCommentsLoading(true);
    // getCommentsByPost(post.id)
    client
      .get<Comment[]>(`/comments?postId=${post.id}`)
      .then(setComments)
      .catch(() => {
        setCommentsLoadError(ErrorType.UNEXPECTED);
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });
  }, [post.id]);

  const handleShowCommentForm = () => {
    setIsCommentFormVisible(true);
  };

  const handleAdd = (data: CommentData) => {
    setCommentAddError('');

    // return addComment({ postId: post.id, ...data })
    //   .then(newComment => {
    //     setComments(current => [...current, newComment]);
    //   })
    //   .catch(error => {
    //     setCommentAddError(ErrorType.UNEXPECTED);

    //     throw error;
    //   });

    return client
      .post<Comment>(`/comments`, data)
      .then(newComment => {
        setComments(current => [...current, newComment]);
      })
      .catch(error => {
        setCommentAddError(ErrorType.UNEXPECTED);

        throw error;
      });
  };

  const handleDelete = (commentId: number) => {
    setCommentDeleteError('');

    const result = optimisticDeleteComment(comments, commentId);

    if (!result) {
      return;
    }

    const { updatedComments, rollback } = result;

    setComments(updatedComments);

    // return deleteComment(commentId).catch(error => {
    //   setComments(currentComments => restoreComment(currentComments, rollback));

    //   setCommentDeleteError(ErrorType.UNEXPECTED);

    //   throw error;
    // });

    return client.delete(`/comments/${commentId}`).catch(error => {
      setComments(currentComments => restoreComment(currentComments, rollback));

      setCommentDeleteError(ErrorType.UNEXPECTED);

      throw error;
    });
  };

  const shouldShowContent = !isCommentsLoading && !commentsLoadError;

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        <h2 data-cy="PostTitle">{`#${post.id}: ${post.title}`}</h2>

        <p data-cy="PostBody">{post.body}</p>
      </div>

      <div className="block">
        {isCommentsLoading && <Loader />}

        {commentsLoadError && (
          <Notification message={commentsLoadError} color={'is-danger'} />
        )}

        {shouldShowContent && comments.length === 0 && (
          <p className="title is-4" data-cy="NoCommentsMessage">
            No comments yet
          </p>
        )}

        {commentDeleteError && (
          <Notification message={commentDeleteError} color="is-danger" />
        )}

        {shouldShowContent && comments.length > 0 && (
          <>
            <p className="title is-4">Comments:</p>

            {comments.map(comment => (
              <article
                className="message is-small"
                data-cy="Comment"
                key={comment.id}
              >
                <div className="message-header">
                  <a href="mailto:misha@mate.academy" data-cy="CommentAuthor">
                    {comment.name}
                  </a>
                  <button
                    data-cy="CommentDelete"
                    type="button"
                    className="delete is-small"
                    aria-label="delete"
                    onClick={() => handleDelete(comment.id)}
                  />
                </div>

                <div className="message-body" data-cy="CommentBody">
                  {comment.body}
                </div>
              </article>
            ))}
          </>
        )}
      </div>

      {commentAddError && (
        <Notification message={commentAddError} color="is-danger" />
      )}

      {shouldShowContent && !isCommentFormVisible && (
        <button
          data-cy="WriteCommentButton"
          type="button"
          className="button is-link"
          onClick={handleShowCommentForm}
        >
          Write a comment
        </button>
      )}

      {shouldShowContent && isCommentFormVisible && (
        <NewCommentForm onSubmit={handleAdd} />
      )}
    </div>
  );
};
