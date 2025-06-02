import React, { useEffect, useState } from 'react';

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data – replace this with actual API call
  useEffect(() => {
    const fetchComments = async () => {
      // Simulate fetching filtered comments
      const mockComments = [
        {
          id: 1,
          postTitle: 'The Art of Light and Shadow',
          commenter: 'JaneDoe',
          content: 'Beautiful piece, I learned a lot!',
          date: 'May 28, 2025',
        },
        {
          id: 2,
          postTitle: 'How to Use Color Psychology in Design',
          commenter: 'ArtLover22',
          content: 'Very insightful, thanks for sharing!',
          date: 'May 27, 2025',
        },
      ];
      setComments(mockComments);
      setLoading(false);
    };

    fetchComments();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Comments on Your Posts
      </h2>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No comments yet on your posts.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-md rounded-lg p-4 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  On: {comment.postTitle}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                "{comment.content}"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                — {comment.commenter}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MyComments;
