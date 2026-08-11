import { useState, useCallback } from 'react';

import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { Notification } from './components/Notification';

import { Post } from './types/Post';

// import { getPostsByUser } from './api/posts';

import { client } from './utils/fetchClient';
import { ErrorType } from './Enums/Error';

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersError, setUsersError] = useState('');
  const [postsError, setPostsError] = useState('');
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const loadPosts = useCallback((userId: number) => {
    if (!userId) {
      setIsPostsLoading(false);

      return;
    }

    setIsPostsLoading(true);
    setPosts([]);
    setPostsError('');
    setSelectedPost(null);
    // getPostsByUser(userId)
    client
      .get<Post[]>(`/posts?userId=${userId}`)
      .then(setPosts)
      .catch(() => {
        setPostsError(ErrorType.UNEXPECTED);
      })
      .finally(() => {
        setIsPostsLoading(false);
      });
  }, []);

  const handleUserSelect = useCallback(
    (userId: number) => {
      if (selectedUserId === userId) {
        return;
      }

      setSelectedUserId(userId);
      setSelectedPost(null);
      loadPosts(userId);
    },
    [selectedUserId, loadPosts],
  );

  const handlePostSelect = useCallback(
    (post: Post) => {
      if (post.id === selectedPost?.id) {
        return;
      }

      setSelectedPost(post);
    },
    [selectedPost],
  );

  const handleUsersError = useCallback((error: string) => {
    setUsersError(error);
  }, []);

  const hasPosts = posts.length > 0;

  const noPosts =
    !!selectedUserId && !isPostsLoading && !postsError && !hasPosts;

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                {usersError && (
                  <Notification message={usersError} color={'is-danger'} />
                )}
                <UserSelector
                  selectedUserId={selectedUserId}
                  onSelect={handleUserSelect}
                  onError={handleUsersError}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUserId && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {isPostsLoading && <Loader />}

                {postsError && (
                  <Notification message={postsError} color={'is-danger'} />
                )}

                {noPosts && (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    No posts yet
                  </div>
                )}

                {hasPosts && (
                  <PostsList posts={posts} onSelect={handlePostSelect} />
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              selectedPost && 'Sidebar--open',
            )}
          >
            {selectedPost && (
              <div className="tile is-child box is-success ">
                <PostDetails post={selectedPost} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
