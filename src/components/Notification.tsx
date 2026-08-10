type Props = {
  message: string;
  color: 'is-danger' | 'is-warning' | 'is-success' | 'is-info';
};

export const Notification = ({ message, color }: Props) => (
  <div className={`notification ${color}`} data-cy="PostsLoadingError">
    {message}
  </div>
);
